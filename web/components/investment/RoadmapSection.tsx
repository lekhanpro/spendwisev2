import React, { useMemo, useState } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { GoalHorizon, GoalPriority, InvestmentGoal, InvestmentRiskBand, InvestorProfile } from '../../types/investment';
import { InvestCard, MetricPill, QuietToggle, SectionTitle } from './InvestUI';
import { formatInr } from './format';

type GoalForm = Omit<InvestmentGoal, 'id'>;

const goalDefaults: GoalForm = {
  name: '',
  type: 'custom',
  targetAmount: 1000000,
  currentAmount: 0,
  monthlyContribution: 10000,
  targetDate: '2030-03-31',
  priority: 'important',
  horizon: 'mid',
};

const expectedReturnMap: Record<InvestmentRiskBand, number> = {
  conservative: 0.08,
  balanced: 0.1,
  growth: 0.12,
  aggressive: 0.14,
};

export const RoadmapSection: React.FC = () => {
  const {
    profile,
    riskBand,
    roadmap,
    recommendations,
    investmentGoals,
    notificationPreferences,
    updateProfile,
    addInvestmentGoal,
    removeInvestmentGoal,
    updateNotificationPreference,
  } = useInvestment();
  const [goalForm, setGoalForm] = useState<GoalForm>(goalDefaults);

  const sipProjection = useMemo(() => {
    const annualRate = expectedReturnMap[riskBand];
    const monthlyRate = annualRate / 12;
    const months = Math.max(profile.investmentHorizonYears * 12, 12);
    const contribution = profile.monthlyInvestable;
    const futureValue = contribution * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const invested = contribution * months;
    return {
      annualRate,
      invested,
      futureValue,
      gain: futureValue - invested,
    };
  }, [profile.investmentHorizonYears, profile.monthlyInvestable, riskBand]);

  const handleGoalSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!goalForm.name) return;
    addInvestmentGoal(goalForm);
    setGoalForm(goalDefaults);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Investor Profile"
            title="Personalized roadmap inputs"
            description="This replaces the old quiz flow with a professional suitability form tied directly to allocation and goal recommendations."
          />
          <div className="grid grid-cols-2 gap-3 mt-5">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Age
              <input
                type="number"
                value={profile.age}
                onChange={(event) => updateProfile({ age: Number(event.target.value) })}
                className="mt-2 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Annual income
              <input
                type="number"
                value={profile.annualIncome}
                onChange={(event) => updateProfile({ annualIncome: Number(event.target.value) })}
                className="mt-2 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Monthly investable
              <input
                type="number"
                value={profile.monthlyInvestable}
                onChange={(event) => updateProfile({ monthlyInvestable: Number(event.target.value) })}
                className="mt-2 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Emergency fund (months)
              <input
                type="number"
                value={profile.emergencyFundMonths}
                onChange={(event) => updateProfile({ emergencyFundMonths: Number(event.target.value) })}
                className="mt-2 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Horizon (years)
              <input
                type="number"
                value={profile.investmentHorizonYears}
                onChange={(event) => updateProfile({ investmentHorizonYears: Number(event.target.value) })}
                className="mt-2 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Dependents
              <input
                type="number"
                value={profile.dependents}
                onChange={(event) => updateProfile({ dependents: Number(event.target.value) })}
                className="mt-2 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Objective
              <select
                value={profile.objective}
                onChange={(event) => updateProfile({ objective: event.target.value as typeof profile.objective })}
                className="mt-2 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="wealth">Wealth creation</option>
                <option value="retirement">Retirement</option>
                <option value="income">Passive income</option>
                <option value="tax-saving">Tax saving</option>
                <option value="education">Education</option>
                <option value="home">Home purchase</option>
              </select>
            </label>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Tax bracket
              <select
                value={profile.taxBracket}
                onChange={(event) => updateProfile({ taxBracket: event.target.value as typeof profile.taxBracket })}
                className="mt-2 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="below-5">Below 5%</option>
                <option value="5-10">5% to 10%</option>
                <option value="10-20">10% to 20%</option>
                <option value="20-30">20% to 30%</option>
                <option value="30-plus">30% plus</option>
              </select>
            </label>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Risk tolerance</span>
              <span className="font-semibold text-gray-900 dark:text-white">{profile.riskTolerance}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={profile.riskTolerance}
              onChange={(event) => updateProfile({ riskTolerance: Number(event.target.value) as InvestorProfile['riskTolerance'] })}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <MetricPill label="Risk Band" value={riskBand} tone="warning" />
            <MetricPill label="Monthly SIP" value={formatInr(profile.monthlyInvestable, 0)} />
            <MetricPill label="Projected Corpus" value={formatInr(sipProjection.futureValue, 0)} tone="positive" />
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle eyebrow="Roadmap" title="Recommended next actions" description="Step-by-step plan based on goal urgency, liquidity buffer, tax bracket, and allocation drift." />
          <div className="space-y-4 mt-5">
            {roadmap.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">{item.timeline}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">{item.focus}</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white mt-2">{item.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <MetricPill label="Invested" value={formatInr(sipProjection.invested, 0)} />
            <MetricPill label="Projected Gain" value={formatInr(sipProjection.gain, 0)} tone="positive" />
            <MetricPill label="Assumed Return" value={`${(sipProjection.annualRate * 100).toFixed(0)}%`} />
          </div>
        </InvestCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <InvestCard className="p-5">
          <SectionTitle eyebrow="Goal Planner" title="Create goal-linked investing plans" description="Tie contributions to dates and keep short-term goals out of high-volatility assets." />
          <form className="space-y-3 mt-5" onSubmit={handleGoalSubmit}>
            <input
              value={goalForm.name}
              onChange={(event) => setGoalForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Goal name"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={goalForm.type}
                onChange={(event) => setGoalForm((current) => ({ ...current, type: event.target.value as GoalForm['type'] }))}
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="retirement">Retirement</option>
                <option value="home">Home</option>
                <option value="education">Education</option>
                <option value="vacation">Vacation</option>
                <option value="wealth">Wealth</option>
                <option value="emergency">Emergency</option>
                <option value="custom">Custom</option>
              </select>
              <select
                value={goalForm.priority}
                onChange={(event) => setGoalForm((current) => ({ ...current, priority: event.target.value as GoalPriority }))}
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="core">Core</option>
                <option value="important">Important</option>
                <option value="aspirational">Aspirational</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={goalForm.targetAmount}
                onChange={(event) => setGoalForm((current) => ({ ...current, targetAmount: Number(event.target.value) }))}
                placeholder="Target amount"
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={goalForm.currentAmount}
                onChange={(event) => setGoalForm((current) => ({ ...current, currentAmount: Number(event.target.value) }))}
                placeholder="Current amount"
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={goalForm.monthlyContribution}
                onChange={(event) => setGoalForm((current) => ({ ...current, monthlyContribution: Number(event.target.value) }))}
                placeholder="Monthly contribution"
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={goalForm.targetDate}
                onChange={(event) => setGoalForm((current) => ({ ...current, targetDate: event.target.value }))}
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={goalForm.horizon}
              onChange={(event) => setGoalForm((current) => ({ ...current, horizon: event.target.value as GoalHorizon }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="short">Short horizon</option>
              <option value="mid">Mid horizon</option>
              <option value="long">Long horizon</option>
            </select>
            <button type="submit" className="w-full py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
              Add goal
            </button>
          </form>
        </InvestCard>

        <div className="space-y-4">
          <InvestCard className="p-5">
            <SectionTitle eyebrow="Goal Progress" title="Funding status" description="Use this to match investment risk with time horizon." />
            <div className="space-y-3 mt-5">
              {investmentGoals.map((goal) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return (
                  <div key={goal.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{goal.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {goal.priority} priority, target {new Date(goal.targetDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <button type="button" onClick={() => removeInvestmentGoal(goal.id)} className="text-sm text-red-500">
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <MetricPill label="Current" value={formatInr(goal.currentAmount, 0)} />
                      <MetricPill label="Target" value={formatInr(goal.targetAmount, 0)} />
                      <MetricPill label="Monthly" value={formatInr(goal.monthlyContribution, 0)} />
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </InvestCard>

          <InvestCard className="p-5">
            <SectionTitle eyebrow="Recommendations" title="Portfolio construction notes" description={recommendations.summary} />
            <div className="grid gap-3 md:grid-cols-2 mt-5">
              {recommendations.mutualFunds.map((bucket) => (
                <div key={bucket.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                  <p className="font-medium text-gray-900 dark:text-white">{bucket.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{bucket.category} · {bucket.horizon}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{bucket.whyItFits}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">{bucket.allocationHint}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-4 mt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">Tax optimization notes</p>
              <div className="space-y-2 mt-3">
                {recommendations.taxIdeas.map((idea) => (
                  <p key={idea} className="text-sm text-gray-700 dark:text-gray-300">{idea}</p>
                ))}
              </div>
            </div>
          </InvestCard>

          <InvestCard className="p-5">
            <SectionTitle eyebrow="Quiet Notifications" title="Panel-only alerts" description="Nothing auto-pops. These only appear inside the notification panel when you opt in." />
            <div className="divide-y divide-gray-200 dark:divide-zinc-800 mt-3">
              <QuietToggle
                label="Market watchlist alerts"
                description="Track watchlist additions and market context updates in the panel."
                checked={notificationPreferences.marketAlerts}
                onChange={(checked) => updateNotificationPreference('marketAlerts', checked)}
              />
              <QuietToggle
                label="Rebalance alerts"
                description="Flag allocation drift above threshold inside the panel."
                checked={notificationPreferences.rebalanceAlerts}
                onChange={(checked) => updateNotificationPreference('rebalanceAlerts', checked)}
              />
              <QuietToggle
                label="Goal alerts"
                description="Surface underfunded or time-sensitive goals in the panel."
                checked={notificationPreferences.goalAlerts}
                onChange={(checked) => updateNotificationPreference('goalAlerts', checked)}
              />
              <QuietToggle
                label="Scheme reminders"
                description="Add tax-bucket review notes to the panel, not as popups."
                checked={notificationPreferences.schemeAlerts}
                onChange={(checked) => updateNotificationPreference('schemeAlerts', checked)}
              />
            </div>
          </InvestCard>
        </div>
      </div>
    </div>
  );
};
