import React, { useState } from 'react'
import './premium.css'
import { useUserAuth } from "../../context/UserAuthContext";
import RazorpayCheckout from './RazorpayCheckout';

const Premium = () => {
    const plans = [
        {
          name: 'Basic',
          priceMonthly: 99,
          priceYearly: 999,
          features: ['5 posts per day', 'Basic Support'],
        },
        {
            name: 'Standard',
            priceMonthly: 199,
            priceYearly: 1999,
            features: ['10 posts per day', 'Basic Support'],
          },
        {
          name: 'Premium',
          priceMonthly: 299,
          priceYearly: 2999,
          features: ['Unlimited posts', 'Priority Support'],
        },
      ];
      const [selectedPlan, setSelectedPlan] = useState(null);
      const { user } = useUserAuth();
      const email = user?.email;
      const handleSubscribe = (plan, frequency) => {
        setSelectedPlan({ ...plan, frequency });
      };
  return (
    <div className='container'>
      <h1 className='pageTitle title'>Premium Plans</h1>
      <div className="subscription-plans" style={{marginTop: "50px"}}>
      {plans.map((plan) => (
        <div key={plan.name} className="plan-card">
          <h3>{plan.name}</h3>
          <p className="price">₹{plan.priceMonthly} / month</p>
          <p className="price">₹{plan.priceYearly} / year</p>
          <ul>
            {plan.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <button onClick={() => handleSubscribe(plan, 'monthly')}>Subscribe Monthly</button>
          <button onClick={() => handleSubscribe(plan, 'yearly')}>Subscribe Yearly</button>
        </div>
      ))}
    </div>
    {selectedPlan && <RazorpayCheckout plan={selectedPlan} email={email} />}
    </div>
  )
}

export default Premium
