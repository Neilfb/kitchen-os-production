/**
 * ESLint Rule: no-service-conflicts
 * 
 * Detects when multiple services are being imported/used for the same data domain
 * to prevent architectural conflicts like the 4-restaurant-services issue.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent multiple services handling the same data domain',
      category: 'Architectural Conflicts',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          domains: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          maxServicesPerDomain: {
            type: 'number',
            minimum: 1,
            default: 1
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      multipleServices: 'Multiple services detected for {{domain}} domain: {{services}}. Consider consolidating to avoid conflicts.',
      conflictingImports: 'Conflicting service imports detected for {{domain}} domain in same file: {{imports}}',
      deprecatedService: 'Service {{service}} is deprecated. Use {{recommended}} instead.'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const domains = options.domains || {
      restaurant: ['restaurant', 'Restaurant'],
      menu: ['menu', 'Menu'], 
      user: ['user', 'User', 'auth', 'Auth'],
      subscription: ['subscription', 'Subscription']
    };
    const maxServicesPerDomain = options.maxServicesPerDomain || 1;

    // Track imports and usage in current file
    const serviceImports = new Map(); // domain -> [service names]
    const serviceUsage = new Map();   // domain -> [usage locations]

    function identifyDomain(serviceName) {
      const lowerName = serviceName.toLowerCase();
      
      for (const [domain, keywords] of Object.entries(domains)) {
        for (const keyword of keywords) {
          if (lowerName.includes(keyword.toLowerCase())) {
            return domain;
          }
        }
      }
      return null;
    }

    function isServiceImport(node) {
      // Check if import contains 'Service' or 'service' or starts with 'use'
      return /service|Service|^use[A-Z]/.test(node.imported?.name || node.local?.name || '');
    }

    function trackServiceImport(node, serviceName) {
      const domain = identifyDomain(serviceName);
      if (!domain) return;

      if (!serviceImports.has(domain)) {
        serviceImports.set(domain, []);
      }
      
      serviceImports.get(domain).push({
        name: serviceName,
        node: node,
        line: node.loc.start.line
      });
    }

    function checkForConflicts() {
      for (const [domain, services] of serviceImports.entries()) {
        if (services.length > maxServicesPerDomain) {
          const serviceNames = services.map(s => s.name);
          
          // Report on the last import to encourage consolidation
          const lastService = services[services.length - 1];
          
          context.report({
            node: lastService.node,
            messageId: 'multipleServices',
            data: {
              domain: domain,
              services: serviceNames.join(', ')
            }
          });
        }
      }
    }

    return {
      // Track named imports
      ImportSpecifier(node) {
        const importName = node.imported.name;
        if (isServiceImport(node)) {
          trackServiceImport(node, importName);
        }
      },

      // Track default imports
      ImportDefaultSpecifier(node) {
        const importName = node.local.name;
        if (isServiceImport(node)) {
          trackServiceImport(node, importName);
        }
      },

      // Track namespace imports
      ImportNamespaceSpecifier(node) {
        const importName = node.local.name;
        if (isServiceImport(node)) {
          trackServiceImport(node, importName);
        }
      },

      // Check for conflicts at end of file
      'Program:exit'() {
        checkForConflicts();
      }
    };
  }
};

// Usage example for .eslintrc.js:
/*
{
  "rules": {
    "./eslint-rules/no-service-conflicts": ["error", {
      "domains": {
        "restaurant": ["restaurant", "Restaurant"],
        "menu": ["menu", "Menu"],
        "user": ["user", "User", "auth", "Auth"]
      },
      "maxServicesPerDomain": 1
    }]
  }
}
*/
