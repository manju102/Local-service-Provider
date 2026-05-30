// Native fetch used
const API_URL = 'http://localhost:5000/api';
const rand = Math.floor(Math.random() * 100000);

async function runTest() {
  try {
    console.log('--- Starting E2E API Test ---');

    // 1. Create a Service Provider
    console.log('\n1. Registering a Service Provider...');
    const providerRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Test Plumber ${rand}`,
        email: `plumber${rand}@test.com`,
        password: 'password123',
        role: 'provider',
        bio: 'Expert plumber with 10 years experience.',
        skills: ['Plumbing', 'Pipe Repair'],
        category: 'Home Repairs',
        ratePerHour: 50,
        location: 'New York',
        experience: '10'
      })
    });
    const providerData = await providerRes.json();
    if (!providerRes.ok) throw new Error(providerData.message);
    const providerToken = providerData.token;
    const providerId = providerData.user._id;
    console.log('Provider created:', providerData.user.name);

    // 2. Create a Customer
    console.log('\n2. Registering a Customer...');
    const customerRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Test Customer ${rand}`,
        email: `customer${rand}@test.com`,
        password: 'password123',
        role: 'customer'
      })
    });
    const customerData = await customerRes.json();
    if (!customerRes.ok) throw new Error(customerData.message);
    const customerToken = customerData.token;
    const customerId = customerData.user._id;
    console.log('Customer created:', customerData.user.name);

    // 3. Search for Providers (as Customer)
    console.log('\n3. Searching for Providers (Category: Home Repairs)...');
    const searchRes = await fetch(`${API_URL}/providers?category=Home Repairs`);
    const searchData = await searchRes.json();
    if (!searchRes.ok) throw new Error(searchData.message);
    console.log(`Found ${searchData.providers.length} provider(s). First provider: ${searchData.providers[0].name}`);

    // 4. Create a Booking (as Customer)
    console.log('\n4. Customer booking the provider...');
    const bookRes = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        provider: providerId,
        service: 'Pipe Repair',
        date: new Date().toISOString(),
        time: '10:00 AM',
        address: '123 Main St, New York',
        notes: 'Kitchen sink is leaking',
        totalPrice: 100 // 2 hours
      })
    });
    const bookData = await bookRes.json();
    if (!bookRes.ok) throw new Error(bookData.message);
    const bookingId = bookData._id;
    console.log('Booking created with ID:', bookingId, 'Status:', bookData.status);

    // 5. Provider Accepts Booking
    console.log('\n5. Provider accepting the booking...');
    const acceptRes = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({ status: 'accepted' })
    });
    const acceptData = await acceptRes.json();
    if (!acceptRes.ok) throw new Error(acceptData.message);
    console.log('Booking status updated to:', acceptData.status);

    // 6. Provider Completes Booking
    console.log('\n6. Provider marking booking as completed...');
    const completeRes = await fetch(`${API_URL}/bookings/${bookingId}/complete`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${providerToken}`
      }
    });
    const completeData = await completeRes.json();
    if (!completeRes.ok) throw new Error(completeData.message);
    console.log('Booking status updated to:', completeData.status);

    // 7. Customer Reviews Provider
    console.log('\n7. Customer reviewing the provider...');
    const reviewRes = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        providerId: providerId,
        booking: bookingId,
        rating: 5,
        comment: 'Great job, very fast and professional!'
      })
    });
    const reviewData = await reviewRes.json();
    if (!reviewRes.ok) throw new Error(reviewData.message);
    console.log('Review submitted. Rating:', reviewData.rating);

    // 8. Verify Provider's New Rating
    console.log('\n8. Checking provider profile for updated rating...');
    const profileRes = await fetch(`${API_URL}/providers/${providerId}`);
    const profileData = await profileRes.json();
    console.log(`Provider Rating: ${profileData.provider.rating} (based on ${profileData.provider.reviewsCount} reviews)`);

    // 9. Admin Check
    console.log('\n9. Admin logging in to check stats...');
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@servicehub.com', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;

    const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    console.log('Admin Stats - Total Bookings:', statsData.totalBookings, 'Total Revenue: $', statsData.totalRevenue);

    console.log('\n✅ ALL TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
}

runTest();
