const Counter = require('../models/Counter');

const nextAssetTag = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'assetTag' },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return `AF-${String(counter.sequenceValue).padStart(4, '0')}`;
};

module.exports = nextAssetTag;
