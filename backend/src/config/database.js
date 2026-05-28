import fs from "fs";
import path from "path";
import crypto from "crypto";
import logger from "../utils/logger.js";

const dbPath = path.resolve(process.cwd(), "../storage/db.json");

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let data = {
  users: [],
  videos: [],
  clips: [],
  transcripts: [],
  processingJobs: [],
};

function load() {
  if (fs.existsSync(dbPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    } catch (e) {
      logger.error("Failed to parse db.json, using empty db.");
    }
  }
}

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

// ─── Seed default user on first load ──────────────────────────
load();
if (data.users.length === 0) {
  data.users.push({
    id: "44381c4e-c5d7-48ae-bde9-8bf0f374e71e",
    name: "Demo User",
    email: "demo@clipforge.ai",
    password: "$2a$12$1Y/Q0Zz.Yg4Hl5Q4E7oXTu9K/.YQeM.m5e/Xn3kP5R.2R5Iq8S",
    createdAt: now(),
    updatedAt: now(),
  });
  save();
}

// ─── Generic helpers ──────────────────────────────────────────

function matchesFilter(item, filter) {
  if (!filter) return true;
  for (const [key, value] of Object.entries(filter)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Support { in: [...] } operator
      if (value.in && Array.isArray(value.in)) {
        if (!value.in.includes(item[key])) return false;
      }
    } else {
      if (item[key] !== value) return false;
    }
  }
  return true;
}

function applySort(arr, orderBy) {
  if (!orderBy) return arr;
  const sorted = [...arr];
  for (const [key, dir] of Object.entries(orderBy)) {
    const mult = dir === "desc" ? -1 : 1;
    sorted.sort((a, b) => (a[key] < b[key] ? -1 * mult : a[key] > b[key] ? 1 * mult : 0));
  }
  return sorted;
}

// ─── Collection class ─────────────────────────────────────────

class Collection {
  constructor(name) {
    this.name = name;
  }

  get items() {
    return data[this.name];
  }

  /** Find all matching items */
  findAll(filter = null, { orderBy, skip, take } = {}) {
    let result = this.items.filter((item) => matchesFilter(item, filter));
    if (orderBy) result = applySort(result, orderBy);
    if (skip) result = result.slice(skip);
    if (take) result = result.slice(0, take);
    return result;
  }

  /** Find first matching item */
  findOne(filter) {
    return this.items.find((item) => matchesFilter(item, filter)) || null;
  }

  /** Count matching items */
  count(filter = null) {
    return this.items.filter((item) => matchesFilter(item, filter)).length;
  }

  /** Insert a new item, returns the created item */
  insert(fields) {
    const item = { id: uuid(), createdAt: now(), updatedAt: now(), ...fields };
    this.items.push(item);
    save();
    return item;
  }

  /** Insert many items at once */
  insertMany(fieldsArray) {
    const created = fieldsArray.map((f) => ({ id: uuid(), createdAt: now(), updatedAt: now(), ...f }));
    this.items.push(...created);
    save();
    return created;
  }

  /** Update the first item matching the filter. Returns updated item or null. */
  updateOne(filter, fields) {
    const idx = this.items.findIndex((item) => matchesFilter(item, filter));
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...fields, updatedAt: now() };
    save();
    return this.items[idx];
  }

  /** Upsert: update if exists, insert if not */
  upsert(filter, updateFields, insertFields) {
    const existing = this.updateOne(filter, updateFields);
    if (existing) return existing;
    return this.insert({ ...filter, ...insertFields });
  }

  /** Delete first matching item. Returns true if deleted. */
  deleteOne(filter) {
    const idx = this.items.findIndex((item) => matchesFilter(item, filter));
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    save();
    return true;
  }

  /** Delete all matching items. Returns number of deleted. */
  deleteMany(filter) {
    const before = this.items.length;
    data[this.name] = this.items.filter((item) => !matchesFilter(item, filter));
    save();
    return before - data[this.name].length;
  }
}

// ─── Exported database interface ──────────────────────────────

const db = {
  users: new Collection("users"),
  videos: new Collection("videos"),
  clips: new Collection("clips"),
  transcripts: new Collection("transcripts"),
  processingJobs: new Collection("processingJobs"),
};

export default db;
