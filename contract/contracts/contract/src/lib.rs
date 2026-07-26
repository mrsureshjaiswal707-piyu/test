#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Symbol};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum DataKey {
    Escrow(u32),
    NextId,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum EscrowStatus {
    Pending,
    Shipped,
    Completed,
    Disputed,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Escrow {
    pub id: u32,
    pub buyer: Address,
    pub seller: Address,
    pub amount: i128,
    pub token: Address,
    pub description: String,
    pub status: EscrowStatus,
    pub shipment_hash: String,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn create_escrow(
        env: Env,
        buyer: Address,
        seller: Address,
        amount: i128,
        token: Address,
        description: String,
    ) -> u32 {
        buyer.require_auth();
        assert!(amount > 0, "amount must be positive");
        token::Client::new(&env, &token)
            .transfer(&buyer, &env.current_contract_address(), &amount);
        let id = env
            .storage()
            .instance()
            .get::<_, u32>(&DataKey::NextId)
            .unwrap_or(0);
        env.storage().persistent().set(
            &DataKey::Escrow(id),
            &Escrow {
                id,
                buyer: buyer.clone(),
                seller: seller.clone(),
                amount,
                token,
                description,
                status: EscrowStatus::Pending,
                shipment_hash: String::from_str(&env, ""),
            },
        );
        env.storage()
            .instance()
            .set(&DataKey::NextId, &(id + 1));
        env.events().publish(
            (Symbol::new(&env, "escrow_created"), buyer, seller),
            (id, amount),
        );
        id
    }

    pub fn confirm_shipment(env: Env, escrow_id: u32, shipment_hash: String) {
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");
        escrow.seller.require_auth();
        assert_eq!(
            escrow.status,
            EscrowStatus::Pending,
            "status must be pending"
        );
        escrow.status = EscrowStatus::Shipped;
        escrow.shipment_hash = shipment_hash.clone();
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);
        env.events().publish(
            (Symbol::new(&env, "shipment_confirmed"), escrow.seller),
            (escrow_id, shipment_hash),
        );
    }

    pub fn confirm_receipt(env: Env, escrow_id: u32) {
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");
        escrow.buyer.require_auth();
        assert_eq!(
            escrow.status,
            EscrowStatus::Shipped,
            "status must be shipped"
        );
        token::Client::new(&env, &escrow.token).transfer(
            &env.current_contract_address(),
            &escrow.seller,
            &escrow.amount,
        );
        escrow.status = EscrowStatus::Completed;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);
        env.events().publish(
            (Symbol::new(&env, "receipt_confirmed"), escrow.buyer),
            (escrow_id, escrow.amount),
        );
    }

    pub fn raise_dispute(env: Env, escrow_id: u32, caller: Address) {
        caller.require_auth();
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found");
        assert!(
            escrow.buyer == caller || escrow.seller == caller,
            "only buyer or seller"
        );
        assert!(
            escrow.status == EscrowStatus::Pending || escrow.status == EscrowStatus::Shipped,
            "cannot dispute in current status"
        );
        escrow.status = EscrowStatus::Disputed;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &escrow);
        env.events().publish(
            (Symbol::new(&env, "dispute_raised"), caller),
            (escrow_id,),
        );
    }

    pub fn get_escrow(env: Env, escrow_id: u32) -> Escrow {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .expect("escrow not found")
    }
}

mod test;
