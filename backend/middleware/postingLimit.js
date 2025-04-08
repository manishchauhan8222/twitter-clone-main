// middleware/checkPostingLimit.js

const { MongoClient, ObjectId } = require('mongodb');
const subscriptionPlans = require('../config/plans');
const client = new MongoClient('your-mongo-db-connection-string');

module.exports = async (req, res, next) => {
  try {
    const userCollection = client.db("database").collection("users");
    const userId = new ObjectId(req.user.id); // Ensure req.user.id is available and is a valid ObjectId
    const user = await userCollection.findOne({ _id: userId });

    const currentPlan = user.subscription.plan;
    const { postLimit } = subscriptionPlans[currentPlan];

    // Check if billing cycle has reset
    const now = new Date();
    const cycleStart = new Date(user.subscription.startDate);
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    if ((currentPlan === 'monthly' && now - cycleStart > oneMonth) ||
        (currentPlan === 'yearly' && now - cycleStart > oneYear)) {
      await userCollection.updateOne(
        { _id: userId },
        {
          $set: { postsThisCycle: 0, billingCycleStart: now }
        }
      );
    }

    if (user.posts >= postLimit) {
      return res.status(403).json({ message: 'Posting limit reached for your subscription plan.' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  } finally {
    await client.close();
  }
};
