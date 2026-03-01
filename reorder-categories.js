const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('src/data/services.json', 'utf8'));
  
  const order = [
    'analytics',
    'application_integration',
    'blockchain',
    'business_applications',
    'cloud_financial_management',
    'compute',
    'customer_enablement',
    'containers',
    'databases',
    'developer_tools',
    'end_user_computing',
    'frontend_web_mobile',
    'game_tech',
    'iot',
    'machine_learning_ai',
    'management_governance',
    'media',
    'migration_transfer',
    'networking_and_content_delivery',
    'quantum_technologies',
    'satellite',
    'security_identity_compliance',
    'storage'
  ];
  
  const catMap = new Map();
  data.categories.forEach(c => catMap.set(c.id, c));
  
  const sorted = [];
  for (const id of order) {
    if (catMap.has(id)) {
      sorted.push(catMap.get(id));
    } else {
      console.error('Missing category:', id);
    }
  }
  
  data.categories = sorted;
  
  fs.writeFileSync('src/data/services.json', JSON.stringify(data, null, 2), 'utf8');
  console.log('SUCCESS: Reordered ' + sorted.length + ' categories');
  sorted.forEach((c, i) => console.log((i+1) + '. ' + c.id));
} catch (err) {
  console.error('ERROR:', err.message);
}
