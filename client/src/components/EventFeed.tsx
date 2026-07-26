"use client";

import { EventCard } from "./EventCard";
import { EmptyState } from "./EmptyState";
import type { EscrowEvent } from "@/types";

interface EventFeedProps {
  events: EscrowEvent[];
}

export function EventFeed({ events }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No events yet"
        description="Events from contract interactions will appear here in real time."
      />
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
}
