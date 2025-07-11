const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/donation-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const campaignSchema = new mongoose.Schema({
  title: String,
  description: String,
  goal: Number,
  amountRaised: {
    type: Number,
    default: 0
  }
});

const donationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  amount: Number
});

const Campaign = mongoose.model('Campaign', campaignSchema);
const Donation = mongoose.model('Donation', donationSchema);

// GET all campaigns
app.get('/api/campaigns', async (req, res) => {
  const campaigns = await Campaign.find();
  res.json(campaigns);
});

// GET one campaign
app.get('/api/campaigns/:id', async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  res.json(campaign);
});

// POST donation
app.post('/api/donations', async (req, res) => {
  const { campaignId, amount } = req.body;

  await Donation.create({ campaignId, amount });

  const campaign = await Campaign.findById(campaignId);
  campaign.amountRaised += amount;
  await campaign.save();

  res.status(200).json({ message: 'Donation successful' });
});

// Add new campaign (optional)
app.post('/api/campaigns', async (req, res) => {
  const { title, description, goal } = req.body;
  const campaign = new Campaign({ title, description, goal });
  await campaign.save();
  res.status(201).json(campaign);
});

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
