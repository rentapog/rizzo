export const mockReferrals = [
  { id: 1, name: "John Doe", status: "Active", joined: "2024-05-01", type: "Direct", passedUpTo: null },
  { id: 2, name: "Sarah Smith", status: "Active", joined: "2024-05-02", type: "Passed Up", passedUpTo: "You" }, // This is the 2nd referral of someone else coming to you
  { id: 3, name: "Mike Johnson", status: "Pending", joined: "2024-05-03", type: "Direct", passedUpTo: null },
  { id: 4, name: "Emma Wilson", status: "Active", joined: "2024-05-05", type: "Direct", passedUpTo: null },
  { id: 5, name: "David Brown", status: "Active", joined: "2024-05-06", type: "Passed Up", passedUpTo: "You" },
];

export const mockStats = {
  totalEarnings: 1250.00,
  activeReferrals: 12,
  passedUpReferrals: 5, // People who came to you from others
  nextPayout: "2024-06-01"
};

export const currentUser = {
  name: "Alex Promoter",
  referralLink: "https://apexnetwork.com/ref/alex-promoter",
  tier: "Premium Affiliate"
};
