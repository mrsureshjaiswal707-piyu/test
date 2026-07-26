#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_create_escrow() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    token_client.mint(&buyer, &1_000_000_000);

    let id = client.create_escrow(
        &buyer,
        &seller,
        &100_000_000,
        &token_addr,
        &String::from_str(&env, "Laptop"),
    );
    assert_eq!(id, 0);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.buyer, buyer);
    assert_eq!(escrow.seller, seller);
    assert_eq!(escrow.amount, 100_000_000);
    assert_eq!(escrow.status, EscrowStatus::Pending);
    assert_eq!(token_client.balance(&buyer), 900_000_000);
}

#[test]
fn test_full_escrow_flow() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    token_client.mint(&buyer, &1_000_000_000);

    let id = client.create_escrow(
        &buyer,
        &seller,
        &100_000_000,
        &token_addr,
        &String::from_str(&env, "Electronics"),
    );
    client.confirm_shipment(&id, &String::from_str(&env, "TRACK-HASH-123"));
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, EscrowStatus::Shipped);
    assert_eq!(
        escrow.shipment_hash,
        String::from_str(&env, "TRACK-HASH-123")
    );

    client.confirm_receipt(&id);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, EscrowStatus::Completed);
    assert_eq!(token_client.balance(&seller), 100_000_000);
}

#[test]
#[should_panic(expected = "escrow not found")]
fn test_get_escrow_not_found() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    client.get_escrow(&999);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_create_escrow_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    client.create_escrow(
        &buyer,
        &seller,
        &0,
        &token_addr,
        &String::from_str(&env, "Free"),
    );
}

#[test]
#[should_panic(expected = "status must be pending")]
fn test_confirm_shipment_wrong_status() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    token_client.mint(&buyer, &1_000_000_000);
    let id = client.create_escrow(
        &buyer,
        &seller,
        &100_000_000,
        &token_addr,
        &String::from_str(&env, "Item"),
    );
    client.confirm_shipment(&id, &String::from_str(&env, "HASH1"));
    client.confirm_shipment(&id, &String::from_str(&env, "HASH2"));
}

#[test]
#[should_panic(expected = "status must be shipped")]
fn test_confirm_receipt_wrong_status() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    token_client.mint(&buyer, &1_000_000_000);
    let id = client.create_escrow(
        &buyer,
        &seller,
        &100_000_000,
        &token_addr,
        &String::from_str(&env, "Item"),
    );
    client.confirm_receipt(&id);
}

#[test]
fn test_raise_dispute_by_buyer() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    token_client.mint(&buyer, &1_000_000_000);
    let id = client.create_escrow(
        &buyer,
        &seller,
        &100_000_000,
        &token_addr,
        &String::from_str(&env, "Item"),
    );
    client.raise_dispute(&id, &buyer);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, EscrowStatus::Disputed);
}

#[test]
fn test_raise_dispute_by_seller() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    token_client.mint(&buyer, &1_000_000_000);
    let id = client.create_escrow(
        &buyer,
        &seller,
        &100_000_000,
        &token_addr,
        &String::from_str(&env, "Item"),
    );
    client.confirm_shipment(&id, &String::from_str(&env, "HASH"));
    client.raise_dispute(&id, &seller);
    let escrow = client.get_escrow(&id);
    assert_eq!(escrow.status, EscrowStatus::Disputed);
}

#[test]
#[should_panic(expected = "cannot dispute in current status")]
fn test_raise_dispute_completed() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    token_client.mint(&buyer, &1_000_000_000);
    let id = client.create_escrow(
        &buyer,
        &seller,
        &100_000_000,
        &token_addr,
        &String::from_str(&env, "Item"),
    );
    client.confirm_shipment(&id, &String::from_str(&env, "HASH"));
    client.confirm_receipt(&id);
    client.raise_dispute(&id, &buyer);
}

#[test]
fn test_multiple_escrows() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);
    let token_admin = Address::generate(&env);
    let token_addr = env.register_stellar_asset_contract(token_admin);
    let token_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_addr);
    let buyer1 = Address::generate(&env);
    let buyer2 = Address::generate(&env);
    let seller1 = Address::generate(&env);
    let seller2 = Address::generate(&env);
    token_client.mint(&buyer1, &1_000_000_000);
    token_client.mint(&buyer2, &1_000_000_000);

    let id1 = client.create_escrow(
        &buyer1,
        &seller1,
        &50_000_000,
        &token_addr,
        &String::from_str(&env, "Item 1"),
    );
    let id2 = client.create_escrow(
        &buyer2,
        &seller2,
        &75_000_000,
        &token_addr,
        &String::from_str(&env, "Item 2"),
    );
    assert_eq!(id1, 0);
    assert_eq!(id2, 1);
    assert_eq!(client.get_escrow(&id1).amount, 50_000_000);
    assert_eq!(client.get_escrow(&id2).amount, 75_000_000);
}
