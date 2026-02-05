import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// Types
export interface Account {
    account_id: string;
    name: string;
    industry: string;
    segment: string;
}

export interface Rep {
    rep_id: string;
    name: string;
}

export interface Deal {
    deal_id: string;
    account_id: string;
    rep_id: string;
    stage: string;
    amount: number | null;
    created_at: string;
    closed_at: string | null;
}

export interface Activity {
    activity_id: string;
    deal_id: string;
    type: string;
    timestamp: string;
}

export interface Target {
    month: string;
    target: number;
}

// Initialize database (in-memory SQLite)
const db = new Database(':memory:');

export function initializeDatabase(): void {
    // Create tables
    db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      account_id TEXT PRIMARY KEY,
      name TEXT,
      industry TEXT,
      segment TEXT
    );

    CREATE TABLE IF NOT EXISTS reps (
      rep_id TEXT PRIMARY KEY,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS deals (
      deal_id TEXT PRIMARY KEY,
      account_id TEXT,
      rep_id TEXT,
      stage TEXT,
      amount REAL,
      created_at TEXT,
      closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      activity_id TEXT PRIMARY KEY,
      deal_id TEXT,
      type TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS targets (
      month TEXT PRIMARY KEY,
      target REAL
    );
  `);

    // Load data from JSON files
    const dataDir = path.join(__dirname, '../../data');

    const accounts: Account[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'accounts.json'), 'utf-8'));
    const reps: Rep[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'reps.json'), 'utf-8'));
    const deals: Deal[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'deals.json'), 'utf-8'));
    const activities: Activity[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'activities.json'), 'utf-8'));
    const targets: Target[] = JSON.parse(fs.readFileSync(path.join(dataDir, 'targets.json'), 'utf-8'));

    // Insert accounts
    const insertAccount = db.prepare('INSERT OR REPLACE INTO accounts VALUES (?, ?, ?, ?)');
    accounts.forEach(a => insertAccount.run(a.account_id, a.name, a.industry, a.segment));

    // Insert reps
    const insertRep = db.prepare('INSERT OR REPLACE INTO reps VALUES (?, ?)');
    reps.forEach(r => insertRep.run(r.rep_id, r.name));

    // Insert deals
    const insertDeal = db.prepare('INSERT OR REPLACE INTO deals VALUES (?, ?, ?, ?, ?, ?, ?)');
    deals.forEach(d => insertDeal.run(d.deal_id, d.account_id, d.rep_id, d.stage, d.amount, d.created_at, d.closed_at));

    // Insert activities
    const insertActivity = db.prepare('INSERT OR REPLACE INTO activities VALUES (?, ?, ?, ?)');
    activities.forEach(a => insertActivity.run(a.activity_id, a.deal_id, a.type, a.timestamp));

    // Insert targets
    const insertTarget = db.prepare('INSERT OR REPLACE INTO targets VALUES (?, ?)');
    targets.forEach(t => insertTarget.run(t.month, t.target));

    console.log('Database initialized with data');
}

export { db };
