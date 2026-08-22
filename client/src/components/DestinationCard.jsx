import React from 'react';
import { MapPin, Compass, Plus } from 'lucide-react';

export default function DestinationCard({ destination, onPlanTrip }) {
  return (
    <div className="glass-card flex flex-col justify-between" style={{ overflow: 'hidden' }}>
      <div style={{ height: '180px', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <img
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className="badge badge-info">
            <Compass style={{ width: 12, height: 12 }} /> {destination.category}
          </span>
        </div>
      </div>

      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="flex items-center gap-1" style={{ marginBottom: '0.3rem' }}>
            <MapPin style={{ width: 16, height: 16, color: '#f59e0b' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {destination.city}, <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{destination.country}</span>
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
            {destination.description}
          </p>
        </div>

        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
            Est. {destination.avgCostPerDay}
          </span>
          <button
            onClick={() => onPlanTrip && onPlanTrip(destination)}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            <span>Plan This</span>
          </button>
        </div>
      </div>
    </div>
  );
}
