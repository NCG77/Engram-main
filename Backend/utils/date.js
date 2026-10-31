function startOfUtcDay(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function isValidObjectId(id) {
  return /^[a-fA-F0-9]{24}$/.test(String(id));
}

module.exports = { startOfUtcDay, isValidObjectId };
