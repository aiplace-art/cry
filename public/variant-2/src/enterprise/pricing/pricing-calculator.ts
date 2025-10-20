/**
 * HypeAI Enterprise Services - Pricing Calculator
 *
 * Intelligent pricing engine that calculates custom quotes based on:
 * - Service configuration
 * - Client attributes
 * - Scope complexity
 * - Market factors
 * - Strategic considerations
 */

export interface PricingFactors {
  // Base service
  serviceId: string;
  basePrice: number;

  // Client attributes
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  isInternational: boolean;

  // Scope factors
  numberOfMarkets?: number;
  numberOfBusinessUnits?: number;
  numberOfCompetitors?: number;
  additionalLanguages?: number;

  // Complexity factors
  industryComplexity: 'low' | 'medium' | 'high';
  dataComplexity: 'low' | 'medium' | 'high';
  regulatoryComplexity: 'low' | 'medium' | 'high';

  // Timeline
  urgency: 'standard' | 'expedited' | 'rush';

  // Add-ons
  addons?: string[];

  // Strategic
  strategicClient: boolean;
  existingClient: boolean;
  portfolioDiscount: boolean;
}

export interface PriceBreakdown {
  basePrice: number;
  adjustments: PriceAdjustment[];
  subtotal: number;
  discount: number;
  discountReason: string;
  total: number;
  confidence: number; // 0-100, how confident we are in this price
  notes: string[];
}

export interface PriceAdjustment {
  factor: string;
  description: string;
  type: 'multiplier' | 'fixed' | 'percentage';
  value: number;
  amount: number;
}

export class EnterprisePricingCalculator {

  /**
   * Calculate custom pricing for a service engagement
   */
  calculatePrice(factors: PricingFactors): PriceBreakdown {
    const adjustments: PriceAdjustment[] = [];
    let currentPrice = factors.basePrice;
    const notes: string[] = [];

    // Company size adjustments
    const sizeAdjustment = this.getCompanySizeAdjustment(factors.companySize);
    if (sizeAdjustment !== 0) {
      const amount = currentPrice * sizeAdjustment;
      adjustments.push({
        factor: 'company_size',
        description: `${factors.companySize.toUpperCase()} company size adjustment`,
        type: 'percentage',
        value: sizeAdjustment * 100,
        amount: amount
      });
      currentPrice += amount;
    }

    // Market multipliers
    if (factors.numberOfMarkets && factors.numberOfMarkets > 1) {
      const additionalMarkets = factors.numberOfMarkets - 1;
      const marketPrice = this.getAdditionalMarketPrice(factors.serviceId);
      const amount = additionalMarkets * marketPrice;

      adjustments.push({
        factor: 'additional_markets',
        description: `${additionalMarkets} additional market(s)`,
        type: 'fixed',
        value: marketPrice,
        amount: amount
      });
      currentPrice += amount;
    }

    // Business unit complexity
    if (factors.numberOfBusinessUnits && factors.numberOfBusinessUnits > 1) {
      const buPrice = this.getBusinessUnitPrice(factors.serviceId);
      const amount = (factors.numberOfBusinessUnits - 1) * buPrice;

      adjustments.push({
        factor: 'business_units',
        description: `${factors.numberOfBusinessUnits - 1} additional business unit(s)`,
        type: 'fixed',
        value: buPrice,
        amount: amount
      });
      currentPrice += amount;
    }

    // Complexity adjustments
    const complexityMultiplier = this.getComplexityMultiplier(
      factors.industryComplexity,
      factors.dataComplexity,
      factors.regulatoryComplexity
    );

    if (complexityMultiplier !== 1.0) {
      const amount = currentPrice * (complexityMultiplier - 1);
      adjustments.push({
        factor: 'complexity',
        description: 'Industry/regulatory/data complexity adjustment',
        type: 'multiplier',
        value: complexityMultiplier,
        amount: amount
      });
      currentPrice += amount;

      if (complexityMultiplier > 1.15) {
        notes.push('High complexity engagement requiring specialized expertise');
      }
    }

    // International operations
    if (factors.isInternational) {
      const intlAmount = this.getInternationalPremium(factors.serviceId);
      adjustments.push({
        factor: 'international',
        description: 'International operations premium',
        type: 'fixed',
        value: intlAmount,
        amount: intlAmount
      });
      currentPrice += intlAmount;
    }

    // Additional languages
    if (factors.additionalLanguages && factors.additionalLanguages > 0) {
      const langPrice = 3000; // Per language
      const amount = factors.additionalLanguages * langPrice;

      adjustments.push({
        factor: 'languages',
        description: `${factors.additionalLanguages} additional language(s)`,
        type: 'fixed',
        value: langPrice,
        amount: amount
      });
      currentPrice += amount;
    }

    // Urgency premium
    const urgencyMultiplier = this.getUrgencyMultiplier(factors.urgency);
    if (urgencyMultiplier > 1.0) {
      const amount = currentPrice * (urgencyMultiplier - 1);
      adjustments.push({
        factor: 'urgency',
        description: `${factors.urgency.toUpperCase()} delivery timeline`,
        type: 'percentage',
        value: (urgencyMultiplier - 1) * 100,
        amount: amount
      });
      currentPrice += amount;
      notes.push('Expedited delivery requires priority resource allocation');
    }

    const subtotal = currentPrice;

    // Calculate discounts
    let discount = 0;
    let discountReason = '';

    if (factors.strategicClient) {
      discount = Math.max(discount, subtotal * 0.15);
      discountReason = 'Strategic client discount (15%)';
      notes.push('Strategic partnership pricing applied');
    } else if (factors.existingClient) {
      discount = Math.max(discount, subtotal * 0.10);
      discountReason = 'Existing client discount (10%)';
    }

    if (factors.portfolioDiscount) {
      const portfolioDisc = subtotal * 0.12;
      if (portfolioDisc > discount) {
        discount = portfolioDisc;
        discountReason = 'Multi-service portfolio discount (12%)';
        notes.push('Portfolio discount for multiple concurrent engagements');
      }
    }

    const total = subtotal - discount;

    // Calculate confidence score
    const confidence = this.calculateConfidence(factors, adjustments);

    return {
      basePrice: factors.basePrice,
      adjustments,
      subtotal,
      discount,
      discountReason,
      total,
      confidence,
      notes
    };
  }

  /**
   * Get company size adjustment multiplier
   */
  private getCompanySizeAdjustment(size: string): number {
    const multipliers = {
      'small': 0,
      'medium': 0.15,
      'large': 0.30,
      'enterprise': 0.50
    };
    return multipliers[size] || 0;
  }

  /**
   * Get additional market pricing
   */
  private getAdditionalMarketPrice(serviceId: string): number {
    const marketPricing = {
      'BA-001': 8000, // Market entry audit
      'MR-001': 10000, // International market research
      'SC-001': 20000, // Market expansion strategy
      'default': 5000
    };
    return marketPricing[serviceId] || marketPricing['default'];
  }

  /**
   * Get business unit pricing
   */
  private getBusinessUnitPrice(serviceId: string): number {
    const buPricing = {
      'BA-003': 5000, // Operational efficiency
      'BA-004': 8000, // Digital transformation
      'SC-002': 15000, // Digital transformation roadmap
      'default': 5000
    };
    return buPricing[serviceId] || buPricing['default'];
  }

  /**
   * Calculate overall complexity multiplier
   */
  private getComplexityMultiplier(
    industry: string,
    data: string,
    regulatory: string
  ): number {
    const complexityScores = {
      'low': 0,
      'medium': 0.10,
      'high': 0.25
    };

    const industryScore = complexityScores[industry] || 0;
    const dataScore = complexityScores[data] || 0;
    const regulatoryScore = complexityScores[regulatory] || 0;

    // Average the complexity factors
    const avgComplexity = (industryScore + dataScore + regulatoryScore) / 3;

    return 1.0 + avgComplexity;
  }

  /**
   * Get international premium
   */
  private getInternationalPremium(serviceId: string): number {
    const premiums = {
      'BA-001': 10000,
      'BA-004': 15000,
      'MR-001': 12000,
      'SC-001': 25000,
      'SC-002': 25000,
      'default': 8000
    };
    return premiums[serviceId] || premiums['default'];
  }

  /**
   * Get urgency multiplier
   */
  private getUrgencyMultiplier(urgency: string): number {
    const multipliers = {
      'standard': 1.0,
      'expedited': 1.25,
      'rush': 1.50
    };
    return multipliers[urgency] || 1.0;
  }

  /**
   * Calculate pricing confidence score
   */
  private calculateConfidence(
    factors: PricingFactors,
    adjustments: PriceAdjustment[]
  ): number {
    let confidence = 100;

    // Reduce confidence for highly complex scenarios
    if (adjustments.length > 6) {
      confidence -= 10;
    }

    // Reduce confidence for extreme customization
    const totalAdjustmentRatio = adjustments.reduce((sum, adj) => sum + Math.abs(adj.amount), 0) / factors.basePrice;
    if (totalAdjustmentRatio > 1.0) {
      confidence -= 15;
    }

    // Reduce confidence for rush jobs (harder to estimate)
    if (factors.urgency === 'rush') {
      confidence -= 10;
    }

    // Increase confidence for existing clients (more data)
    if (factors.existingClient) {
      confidence += 5;
    }

    return Math.max(60, Math.min(100, confidence));
  }

  /**
   * Generate price range based on factors
   */
  generatePriceRange(factors: PricingFactors): {
    minimum: number;
    typical: number;
    maximum: number;
  } {
    const typical = this.calculatePrice(factors).total;

    // Generate range: -15% to +25% of typical
    return {
      minimum: Math.round(typical * 0.85),
      typical: Math.round(typical),
      maximum: Math.round(typical * 1.25)
    };
  }

  /**
   * Calculate ROI projection for client
   */
  calculateClientROI(
    serviceId: string,
    pricing: number,
    clientRevenue: number
  ): {
    projectedValue: number;
    roiMultiple: number;
    paybackMonths: number;
    assumptions: string[];
  } {
    const roiModels = {
      'BA-001': { // Market entry audit
        valueMultiplier: 12,
        timeToValue: 12,
        assumptions: [
          'Market entry generates 2-5% of total revenue within 24 months',
          'Audit reduces entry risk by 30-40%',
          'Prevents costly mistakes averaging 3x audit cost'
        ]
      },
      'BA-002': { // Financial audit
        valueMultiplier: 20,
        timeToValue: 6,
        assumptions: [
          'Cost savings identified: 15% of annual costs',
          'Revenue optimization: 5-10% improvement',
          'Working capital improvements: $500K-2M'
        ]
      },
      'BA-003': { // Operational efficiency
        valueMultiplier: 15,
        timeToValue: 9,
        assumptions: [
          '20-30% operational cost reduction identified',
          'Process improvements yield 25% efficiency gains',
          'Automation saves 30-40% of manual labor costs'
        ]
      },
      'SC-001': { // Market expansion
        valueMultiplier: 18,
        timeToValue: 18,
        assumptions: [
          'New market revenue: 5-15% of total revenue by year 3',
          'Strategy accelerates market entry by 6-12 months',
          'Reduces risk of market entry failure by 50%'
        ]
      },
      'SC-002': { // Digital transformation
        valueMultiplier: 25,
        timeToValue: 24,
        assumptions: [
          'Revenue growth: 15-25% from digital channels',
          'Cost reduction: 20-30% from automation',
          'Customer experience improvement drives 10% retention increase'
        ]
      },
      'default': {
        valueMultiplier: 10,
        timeToValue: 12,
        assumptions: ['Conservative estimate based on industry benchmarks']
      }
    };

    const model = roiModels[serviceId] || roiModels['default'];

    return {
      projectedValue: pricing * model.valueMultiplier,
      roiMultiple: model.valueMultiplier,
      paybackMonths: model.timeToValue,
      assumptions: model.assumptions
    };
  }

  /**
   * Generate payment schedule based on project timeline
   */
  generatePaymentSchedule(
    totalAmount: number,
    durationWeeks: number,
    paymentModel: 'deposit' | 'milestone' | 'monthly'
  ): Array<{
    description: string;
    percentage: number;
    amount: number;
    dueDate: string; // Relative, e.g., "Upon signing", "Week 4"
  }> {
    const schedule = [];

    if (paymentModel === 'deposit') {
      // Standard deposit model: 40% / 30% / 30%
      schedule.push({
        description: 'Deposit upon contract signing',
        percentage: 40,
        amount: totalAmount * 0.40,
        dueDate: 'Upon signing'
      });

      schedule.push({
        description: 'Midpoint payment',
        percentage: 30,
        amount: totalAmount * 0.30,
        dueDate: `Week ${Math.floor(durationWeeks / 2)}`
      });

      schedule.push({
        description: 'Final payment upon delivery',
        percentage: 30,
        amount: totalAmount * 0.30,
        dueDate: `Week ${durationWeeks}`
      });
    } else if (paymentModel === 'milestone') {
      // 4-milestone model
      const milestones = [
        { desc: 'Project kickoff', week: 0, pct: 25 },
        { desc: 'Phase 1 completion', week: Math.floor(durationWeeks * 0.33), pct: 25 },
        { desc: 'Phase 2 completion', week: Math.floor(durationWeeks * 0.67), pct: 25 },
        { desc: 'Final delivery', week: durationWeeks, pct: 25 }
      ];

      milestones.forEach(m => {
        schedule.push({
          description: m.desc,
          percentage: m.pct,
          amount: totalAmount * (m.pct / 100),
          dueDate: m.week === 0 ? 'Upon signing' : `Week ${m.week}`
        });
      });
    } else if (paymentModel === 'monthly') {
      // Monthly payments
      const months = Math.ceil(durationWeeks / 4);
      const monthlyAmount = totalAmount / months;

      for (let i = 0; i < months; i++) {
        schedule.push({
          description: `Month ${i + 1} payment`,
          percentage: (1 / months) * 100,
          amount: monthlyAmount,
          dueDate: `Month ${i + 1}`
        });
      }
    }

    return schedule;
  }
}

// Export singleton instance
export const pricingCalculator = new EnterprisePricingCalculator();
