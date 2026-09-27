async function runFullVerification() {
  const baseUrl = 'http://localhost:5000/api/v1';

  console.log('🧪 Starting End-to-End Integration & User Isolation Acceptance Verification...\n');

  // 1. Register User A
  console.log('1️⃣ Registering User A...');
  const regARes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password123!'
    })
  });
  const regAData: any = await regARes.json();
  if (!regAData.success) throw new Error(`User A Register Failed: ${JSON.stringify(regAData)}`);
  const tokenA = regAData.data.accessToken;
  console.log('   ✅ User A Registered. Token acquired.');

  // 2. User A creates Topic "AI Tools"
  console.log('2️⃣ User A creating Topic "AI Tools"...');
  const topicRes = await fetch(`${baseUrl}/topics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      name: 'AI Tools',
      description: 'Generative AI and research assistants',
      icon: 'Bot',
      color: '#6366f1'
    })
  });
  const topicData: any = await topicRes.json();
  if (!topicData.success) throw new Error(`Topic Create Failed: ${JSON.stringify(topicData)}`);
  const topicAId = topicData.data.id;
  console.log(`   ✅ Topic Created: "${topicData.data.name}" (ID: ${topicAId})`);

  // 3. User A adds flexible items with custom fields
  console.log('3️⃣ User A adding flexible items inside "AI Tools"...');
  const itemRes = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      topicId: topicAId,
      title: 'ChatGPT & GPT-4o',
      content: 'Official OpenAI conversational agent notes',
      tags: ['AI', 'OpenAI'],
      fields: [
        { name: 'Website', type: 'url', value: 'https://chatgpt.com' },
        { name: 'Category', type: 'select', value: 'Chatbot' },
        { name: 'Pricing', type: 'text', value: 'Free / $20 Plus' }
      ]
    })
  });
  const itemData: any = await itemRes.json();
  if (!itemData.success) throw new Error(`Item Create Failed: ${JSON.stringify(itemData)}`);
  const createdItemId = itemData.data.id;
  console.log(`   ✅ Flexible Item Created: "${itemData.data.title}" (ID: ${createdItemId})`);

  // 4. Edit item
  console.log('4️⃣ User A updating item...');
  const editRes = await fetch(`${baseUrl}/items/${createdItemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      title: 'ChatGPT & GPT-4o (Verified)'
    })
  });
  const editData: any = await editRes.json();
  if (!editData.success) throw new Error(`Item Edit Failed: ${JSON.stringify(editData)}`);
  console.log(`   ✅ Item Updated: "${editData.data.title}"`);

  // 5. Search test
  console.log('5️⃣ Testing Global Search for "ChatGPT"...');
  const searchRes = await fetch(`${baseUrl}/search?q=ChatGPT`, {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const searchData: any = await searchRes.json();
  if (!searchData.success || searchData.data.items.length === 0) {
    throw new Error('Search did not find the expected item');
  }
  console.log(`   ✅ Search Verified! Found ${searchData.data.items.length} items matching "ChatGPT"`);

  // 6. User B isolation
  console.log('6️⃣ Registering User B & Testing Data Isolation...');
  const regBRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'Password123!'
    })
  });
  const regBData: any = await regBRes.json();
  const tokenB = regBData.data.accessToken;

  // User B cannot access User A item
  const bItemRes = await fetch(`${baseUrl}/items/${createdItemId}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  if (bItemRes.status !== 404) {
    throw new Error(`SECURITY VULNERABILITY! User B accessed User A item with status ${bItemRes.status}`);
  }
  console.log('   🛡️ Verified: User B CANNOT access User A item (Status 404 Not Found)');

  console.log('\n🎉 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
}

runFullVerification().catch(err => {
  console.error('❌ Verification Failed:', err.message);
  process.exit(1);
});
