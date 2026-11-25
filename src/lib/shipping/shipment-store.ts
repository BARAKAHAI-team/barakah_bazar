import fs from 'fs';
import path from 'path';

export interface ShipmentCheckpoint {
  status: string;
  location: string;
  note: string;
  timestamp: string;
}

export interface ShipmentRecord {
  orderId: string;
  orderNumber: string;
  courier: 'Shadowfax';
  awbNumber: string;
  trackingUrl: string;
  status: 'MANIFESTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  estimatedDelivery: string;
  dispatchedAt: string;
  mode: 'LIVE' | 'SANDBOX';
  checkpoints: ShipmentCheckpoint[];
}

function getStorePath(): string {
  return path.join(process.cwd(), 'src', 'data', 'shipments.json');
}

function readAllShipments(): Record<string, ShipmentRecord> {
  try {
    const filePath = getStorePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.warn('Could not read shipments.json:', err);
  }
  return {};
}

function writeAllShipments(data: Record<string, ShipmentRecord>): void {
  try {
    const filePath = getStorePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write shipments.json:', err);
  }
}

export function getShipmentByOrderId(orderId: string): ShipmentRecord | null {
  const all = readAllShipments();
  return all[orderId] || null;
}

export function getShipmentByAwb(awbNumber: string): ShipmentRecord | null {
  const all = readAllShipments();
  return Object.values(all).find((s) => s.awbNumber === awbNumber) || null;
}

export function saveShipment(record: ShipmentRecord): ShipmentRecord {
  const all = readAllShipments();
  all[record.orderId] = record;
  writeAllShipments(all);
  return record;
}
