import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ArrowRight, CheckCircle2, AlertCircle, Lightbulb, Users, Link2, Zap, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function DomainEducation() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center"
          >
            <div className="flex justify-center">
              <Globe className="h-16 w-16 text-blue-200" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Understanding Domains</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Learn everything you need to know about domain names, how they work, and why they matter for your business
            </p>
          </motion.div>
        </div>
      </section>

      {/* What is a Domain */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Globe className="h-8 w-8 text-blue-600" />
                What Exactly is a Domain Name?
              </h2>
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="pt-8 space-y-4">
                  <p className="text-lg text-gray-800">
                    A <strong>domain name</strong> is your unique address on the internet. Think of it like your home address, but for the web.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                    <p className="font-bold text-lg mb-2">Real-World Example:</p>
                    <p className="text-gray-700 mb-4">
                      If you owned the domain <strong>realestate.com</strong>, your website address would be:
                    </p>
                    <div className="bg-slate-900 text-white p-3 rounded font-mono text-center">
                      https://realestate.com
                    </div>
                    <p className="text-gray-700 mt-4">
                      People could find your real estate business by simply typing "realestate.com" in their browser address bar.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold text-gray-800">A domain name has three main parts:</p>
                    <div className="grid gap-3">
                      <div className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200">
                        <div className="font-bold text-blue-600 min-w-fit">Name:</div>
                        <div>The word(s) you want (like "realestate")</div>
                      </div>
                      <div className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200">
                        <div className="font-bold text-blue-600 min-w-fit">Dot:</div>
                        <div>The period separating parts (the ".")</div>
                      </div>
                      <div className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200">
                        <div className="font-bold text-blue-600 min-w-fit">Extension:</div>
                        <div>The ending (.com, .net, .org, etc.)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Renting vs Buying */}
      <section className="py-16 px-4 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-600" />
                Renting vs. Buying: What's the Difference?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Renting */}
              <motion.div variants={itemVariants}>
                <Card className="h-full border-2 border-orange-300 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <AlertCircle className="h-6 w-6" />
                      Renting a Domain
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <p className="font-semibold text-orange-900 mb-2">How It Works:</p>
                      <p className="text-gray-700 text-sm">
                        You pay a <strong>daily fee</strong> to use a domain. Once you stop paying, someone else can rent it.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-orange-900">Pros:</p>
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-600 font-bold">✓</span> Low cost to start
                        </li>
                        <li className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-600 font-bold">✓</span> Try before committing
                        </li>
                        <li className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-600 font-bold">✓</span> Daily payouts while renting
                        </li>
                      </ul>
                    </div>

                    <div className="bg-orange-100 border border-orange-300 p-3 rounded-lg">
                      <p className="font-semibold text-orange-900 text-sm mb-2">Cons:</p>
                      <ul className="space-y-1 text-sm text-orange-900">
                        <li>❌ You don't own it - it's temporary</li>
                        <li>❌ Can't build long-term brand value</li>
                        <li>❌ Lose it when you stop paying</li>
                        <li>❌ Hard for customers to remember it's yours</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-300 p-3 rounded-lg text-sm">
                      <p className="font-semibold text-yellow-900">Example:</p>
                      <p className="text-gray-700">
                        Rent "crypto.com" for $20/day. You keep the income while you pay. Stop paying? Someone else can rent it next.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Buying */}
              <motion.div variants={itemVariants}>
                <Card className="h-full border-2 border-green-300 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-6 w-6" />
                      Buying a Domain
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">How It Works:</p>
                      <p className="text-gray-700 text-sm">
                        You <strong>own the domain permanently</strong>. You renew yearly to keep it, but it's yours for life.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-green-900">Pros:</p>
                      <ul className="space-y-2">
                        <li className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-600 font-bold">✓</span> <strong>You truly own it</strong>
                        </li>
                        <li className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-600 font-bold">✓</span> Build permanent brand value
                        </li>
                        <li className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-600 font-bold">✓</span> Customers remember YOU
                        </li>
                        <li className="flex gap-2 text-sm text-gray-700">
                          <span className="text-green-600 font-bold">✓</span> Can sell it later if you want
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg">
                      <p className="font-semibold text-gray-900 text-sm mb-2">Cons:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>❌ Higher upfront cost</li>
                        <li>❌ Annual renewal fees</li>
                        <li>❌ No daily income from ownership</li>
                      </ul>
                    </div>

                    <div className="bg-green-100 border border-green-300 p-3 rounded-lg text-sm">
                      <p className="font-semibold text-green-900">Example:</p>
                      <p className="text-gray-700">
                        Buy "crypto.com" once. It's yours forever. People always know where to find you. It becomes your brand.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-blue-300 bg-blue-50">
                <CardContent className="pt-8 space-y-4">
                  <div className="flex gap-4 items-start">
                    <Lightbulb className="h-6 w-6 text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-blue-900 mb-2">Key Difference:</p>
                      <p className="text-gray-800">
                        <strong>Renting</strong> is like leasing an apartment - you use it temporarily. <strong>Buying</strong> is like owning a house - it's yours permanently. With RentAPog, you can do BOTH! Rent domains for daily income, or buy your own branded domain to build your business.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How Domain Forwarding Works */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Link2 className="h-8 w-8 text-purple-600" />
                How Domain Forwarding Works
              </h2>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-purple-300 bg-purple-50">
                <CardContent className="pt-8 space-y-6">
                  <p className="text-lg text-gray-800">
                    Domain forwarding is <strong>automatic redirection</strong>. When someone visits your domain, they're automatically sent to a different website.
                  </p>

                  <div className="bg-white rounded-lg p-6 border-2 border-purple-300">
                    <p className="font-bold text-lg mb-4 text-gray-900">Think of it like this:</p>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold shrink-0">1</div>
                        <div>
                          <p className="font-semibold text-gray-900">Customer Types Your Domain</p>
                          <p className="text-gray-700">They type "crypto.com" in their browser</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold shrink-0">2</div>
                        <div>
                          <p className="font-semibold text-gray-900">The Domain Forwards Them</p>
                          <p className="text-gray-700">The domain is set up to automatically send them somewhere else</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="bg-green-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold shrink-0">3</div>
                        <div>
                          <p className="font-semibold text-gray-900">They Arrive at Your Destination</p>
                          <p className="text-gray-700">They end up on your website, sales page, or affiliate link automatically</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 text-white p-6 rounded-lg font-mono text-sm space-y-4">
                    <p className="text-yellow-400">Example: Domain Forwarding in Action</p>
                    <div className="border-l-4 border-yellow-400 pl-4 space-y-2">
                      <p>User types: <span className="text-cyan-400">https://techstartup.com</span></p>
                      <p className="text-gray-400">↓ (automatic forward)</p>
                      <p>They arrive at: <span className="text-green-400">https://www.your-startup.com/?aff=ABC123</span></p>
                    </div>
                  </div>

                  <div className="bg-blue-100 border-2 border-blue-400 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">💡 Why This Matters:</p>
                    <p className="text-gray-800">
                      Domain forwarding makes it <strong>invisible to the customer</strong>. They think they're visiting your domain, but you can forward them to your actual website, sales page, or affiliate link. It's seamless and automatic!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Practical Examples</h3>
              <div className="space-y-4">
                <Card className="border-2 border-gray-300">
                  <CardContent className="pt-6">
                    <p className="font-semibold text-lg mb-3 text-gray-900">Example 1: Marketing Manager</p>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg space-y-3">
                      <p className="text-gray-800">
                        <strong>Situation:</strong> You're a marketing manager with a short, memorable domain "socialboost.com"
                      </p>
                      <p className="text-gray-800">
                        <strong>What you do:</strong> Forward the domain to your company's marketing landing page
                      </p>
                      <p className="text-gray-800">
                        <strong>Result:</strong> Everyone can easily remember and visit "socialboost.com" instead of a long, complicated URL
                      </p>
                      <div className="bg-white p-3 rounded text-sm font-mono">
                        <p className="text-gray-600">socialboost.com → company-landing-page.com/marketing</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-300">
                  <CardContent className="pt-6">
                    <p className="font-semibold text-lg mb-3 text-gray-900">Example 2: Affiliate Marketer</p>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg space-y-3">
                      <p className="text-gray-800">
                        <strong>Situation:</strong> You rent "fitnesstools.com" to earn affiliate commissions
                      </p>
                      <p className="text-gray-800">
                        <strong>What you do:</strong> Forward it to your affiliate link for fitness equipment
                      </p>
                      <p className="text-gray-800">
                        <strong>Result:</strong> Customers visit a memorable domain, but you get credit for the sale
                      </p>
                      <div className="bg-white p-3 rounded text-sm font-mono">
                        <p className="text-gray-600">fitnesstools.com → amazon.com?affiliate=YOUR_ID</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-300">
                  <CardContent className="pt-6">
                    <p className="font-semibold text-lg mb-3 text-gray-900">Example 3: Small Business Owner</p>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg space-y-3">
                      <p className="text-gray-800">
                        <strong>Situation:</strong> You own "pizzaplace.com" for your local pizza shop
                      </p>
                      <p className="text-gray-800">
                        <strong>What you do:</strong> Forward it to your restaurant website with menu and reservations
                      </p>
                      <p className="text-gray-800">
                        <strong>Result:</strong> Customers find you easily, and your brand sticks in their memory
                      </p>
                      <div className="bg-white p-3 rounded text-sm font-mono">
                        <p className="text-gray-600">pizzaplace.com → www.pizzaplace-restaurant.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Memorable Domains Matter */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Lightbulb className="h-8 w-8 text-orange-600" />
                Why Memorable Domains Matter
              </h2>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="pt-8 space-y-6">
                  <p className="text-lg text-gray-800">
                    A great domain name is <strong>powerful marketing</strong>. It's the difference between building a real business or staying invisible.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-l-4 border-red-600">
                      <p className="font-bold text-lg mb-2 text-red-600">❌ BAD: Hard to Remember</p>
                      <p className="text-gray-700 mb-3">Try to remember and share these with a friend:</p>
                      <ul className="space-y-2 text-sm text-gray-600 font-mono">
                        <li>• www.marketing-services-inc-2024.com</li>
                        <li>• digital-marketing-agency-number-seven.com</li>
                        <li>• getfitnessproductstoday-discount.com</li>
                      </ul>
                      <p className="text-gray-700 mt-3 text-sm italic">These are too long and complicated to remember or share verbally.</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                      <p className="font-bold text-lg mb-2 text-green-600">✓ GOOD: Memorable & Shareable</p>
                      <p className="text-gray-700 mb-3">These stick in people's heads:</p>
                      <ul className="space-y-2 text-sm text-gray-600 font-bold">
                        <li>• marketing.com</li>
                        <li>• fitnessgear.com</li>
                        <li>• techbootcamp.com</li>
                      </ul>
                      <p className="text-gray-700 mt-3 text-sm italic">Short, clear, and people can easily remember and share them!</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-100 border-2 border-blue-400 p-4 rounded-lg">
                      <p className="font-bold text-blue-900 mb-2">🧠 Memory Test</p>
                      <p className="text-sm text-gray-800">
                        If someone told you their business domain at a party, could you remember it AND type it correctly the next day?
                      </p>
                    </div>

                    <div className="bg-purple-100 border-2 border-purple-400 p-4 rounded-lg">
                      <p className="font-bold text-purple-900 mb-2">📢 Sharing Test</p>
                      <p className="text-sm text-gray-800">
                        Would you be willing to recommend it to a friend verbally? Or would you need to show them in writing?
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">The Power of a Memorable Domain</h3>
              <div className="space-y-4">
                <Card className="border-2 border-gray-300 bg-white">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-4">
                      <Users className="h-8 w-8 text-green-600 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 mb-2">🎯 Easier to Find & Share</p>
                        <p className="text-gray-700">
                          Short domains are easy to remember, type, and share. Your customers can tell their friends without stuttering!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-300 bg-white">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-4">
                      <Lightbulb className="h-8 w-8 text-yellow-600 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 mb-2">💡 Better Brand Recognition</p>
                        <p className="text-gray-700">
                          People associate your domain with your business. A memorable domain = a strong brand in their mind.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-300 bg-white">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-4">
                      <ArrowRight className="h-8 w-8 text-blue-600 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 mb-2">📈 More Traffic & Sales</p>
                        <p className="text-gray-700">
                          When your domain is easy to remember, people visit more often. More visits = more sales and referrals.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-300 bg-white">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-4">
                      <DollarSign className="h-8 w-8 text-green-600 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 mb-2">💰 Real Business Asset</p>
                        <p className="text-gray-700">
                          A great domain name actually increases in value over time. It becomes something you can sell for thousands or millions.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Buying is Better Than Renting for Long-Term */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                Why BUYING a Domain is Better for Your Business
              </h2>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="pt-8 space-y-6">
                  <p className="text-lg text-gray-800">
                    If you're serious about building a business or brand, <strong>buying a domain is THE better choice</strong>. Here's why:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                      <p className="font-bold text-lg mb-3 text-green-600">1️⃣ You Can Tell People Your URL</p>
                      <p className="text-gray-700 mb-3">
                        This is HUGE. When you own your domain, people can easily share it and find you.
                      </p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Scenario:</strong> You meet someone at an event. You say "Find me at crypto.com" and they actually remember and visit. That's powerful!
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                      <p className="font-bold text-lg mb-3 text-green-600">2️⃣ You Own Your Brand Identity</p>
                      <p className="text-gray-700 mb-3">
                        Your domain is YOUR brand. It represents you, and no one can take it away.
                      </p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Compare:</strong> "I own crypto.com" (you're the boss) vs "I'm renting crypto.com" (temporary, loses credibility)
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                      <p className="font-bold text-lg mb-3 text-green-600">3️⃣ Build Lasting Credibility</p>
                      <p className="text-gray-700 mb-3">
                        Owning a domain shows you're serious and trustworthy. Customers prefer doing business with people who own their own brand.
                      </p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Trust Factor:</strong> Would you trust someone more if they had their own branded website or a temporary rented one?
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                      <p className="font-bold text-lg mb-3 text-green-600">4️⃣ Consistency Across Time</p>
                      <p className="text-gray-700 mb-3">
                        When you own a domain, it's YOURS forever. You can build your reputation on it for years.
                      </p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Example:</strong> Apple.com has been Apple's brand for 30+ years. That consistency = billions in brand value!
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                      <p className="font-bold text-lg mb-3 text-green-600">5️⃣ Your Domain Increases in Value</p>
                      <p className="text-gray-700 mb-3">
                        Great domains become more valuable over time. You can sell it later if you want.
                      </p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Real Story:</strong> Domain "insurance.com" sold for $35 million! Even regular good domains can sell for thousands.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                      <p className="font-bold text-lg mb-3 text-green-600">6️⃣ Marketing Advantage</p>
                      <p className="text-gray-700 mb-3">
                        You can use your domain across business cards, emails, social media, and ads. It ties everything together.
                      </p>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Power:</strong> email@crypto.com, business card says "crypto.com", ads point to "crypto.com" = unified brand
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-600 p-6 rounded-lg">
                    <p className="font-bold text-lg text-green-900 mb-3">🎯 Bottom Line:</p>
                    <p className="text-gray-800">
                      <strong>Renting domains is for quick income.</strong> But if you want to build a REAL, lasting business that people know and trust, <strong>buying a memorable domain is essential.</strong> It's the foundation of your brand, and brands are priceless.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Now that you understand how domains work, it's time to take action. You can either rent domains for daily income, or buy your own branded domain to build your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg"
                onClick={() => window.location.href = '/domain-rental'}
              >
                <Globe className="h-5 w-5 mr-2" />
                Rent Domains for Income
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="h-14 px-8 border-white text-white hover:bg-white/20 font-bold text-lg"
                onClick={() => window.location.href = '/domain-registry'}
              >
                <Globe className="h-5 w-5 mr-2" />
                Buy Your Own Domain
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
