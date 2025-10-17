/* ===================================
   Twitter Data Validators
   Schema validation for all incoming data
   =================================== */

class TwitterDataError extends Error {
    constructor(message, type, details) {
        super(message);
        this.name = 'TwitterDataError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date();
    }
}

// Data schemas
const TwitterDataSchemas = {
    posting_history: {
        type: 'object',
        required: ['posted', 'lastIndex', 'startedAt'],
        properties: {
            posted: {
                type: 'array',
                items: { type: 'object' }
            },
            lastIndex: {
                type: 'number',
                minimum: 0
            },
            lastPosted: {
                type: ['string', 'null']
            },
            startedAt: {
                type: 'string'
            }
        }
    },
    analytics: {
        type: 'object',
        required: ['websiteVisits', 'conversions', 'growth'],
        properties: {
            websiteVisits: {
                type: 'object',
                required: ['total', 'unique'],
                properties: {
                    total: { type: 'number', minimum: 0 },
                    unique: { type: 'number', minimum: 0 },
                    last24h: { type: 'number', minimum: 0 }
                }
            },
            conversions: {
                type: 'object',
                properties: {
                    signups: { type: 'number', minimum: 0 },
                    walletConnects: { type: 'number', minimum: 0 },
                    socialFollows: { type: 'number', minimum: 0 }
                }
            },
            growth: {
                type: 'object',
                properties: {
                    daily: { type: 'array' },
                    weekly: { type: 'array' },
                    monthly: { type: 'array' }
                }
            },
            timestamp: { type: 'string' }
        }
    },
    marketing_insights: {
        type: 'object',
        required: ['hashtags', 'competitors', 'recommendations'],
        properties: {
            timestamp: { type: ['string', 'null'] },
            hashtags: { type: 'array' },
            competitors: { type: 'array' },
            influencers: { type: 'array' },
            recommendations: { type: 'array' }
        }
    }
};

function validateTwitterData(data, schemaType) {
    const schema = TwitterDataSchemas[schemaType];

    if (!schema) {
        throw new TwitterDataError(
            `Unknown schema type: ${schemaType}`,
            'invalid_schema',
            { schemaType }
        );
    }

    const errors = [];

    // Check if data exists
    if (!data || typeof data !== 'object') {
        throw new TwitterDataError(
            'Data must be an object',
            'validation',
            { data, schemaType }
        );
    }

    // Validate required fields
    if (schema.required) {
        for (const field of schema.required) {
            if (!(field in data)) {
                errors.push(`Missing required field: ${field}`);
            }
        }
    }

    // Validate property types and constraints
    for (const [key, value] of Object.entries(data)) {
        const propSchema = schema.properties?.[key];
        if (!propSchema) continue;

        const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
        const expectedTypes = Array.isArray(propSchema.type) ? propSchema.type : [propSchema.type];

        if (!expectedTypes.includes(actualType)) {
            errors.push(
                `Invalid type for ${key}: expected ${expectedTypes.join('|')}, got ${actualType}`
            );
        }

        // Validate number constraints
        if (actualType === 'number' && propSchema.minimum !== undefined && value < propSchema.minimum) {
            errors.push(`${key} is below minimum: ${value} < ${propSchema.minimum}`);
        }

        // Validate nested objects
        if (propSchema.type === 'object' && propSchema.required) {
            for (const nestedField of propSchema.required) {
                if (!(nestedField in value)) {
                    errors.push(`Missing required nested field: ${key}.${nestedField}`);
                }
            }
        }
    }

    if (errors.length > 0) {
        throw new TwitterDataError(
            'Data validation failed',
            'validation',
            { errors, schemaType, data }
        );
    }

    return true;
}

// Sanitize data before display (XSS prevention)
function sanitizeForDisplay(value) {
    if (typeof value === 'string') {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    return value;
}

// Check data freshness
function checkDataFreshness(timestamp, maxAgeMs = 300000) {
    if (!timestamp) return { fresh: false, age: null, warning: 'No timestamp available' };

    const age = Date.now() - new Date(timestamp).getTime();
    const fresh = age <= maxAgeMs;
    const ageMinutes = Math.floor(age / 60000);

    return {
        fresh,
        age,
        ageMinutes,
        warning: fresh ? null : `Data is ${ageMinutes} minutes old`
    };
}

// Export
window.TwitterValidators = {
    validateTwitterData,
    sanitizeForDisplay,
    checkDataFreshness,
    TwitterDataError
};
