
async function test() {
    const baseUrl = 'http://localhost:3000/api';
    const email = "test_user_auth_check@uide.edu.ec";
    const password = "securePassword123!";

    // 0. Register (just in case)
    console.log('0. Registering/Ensuring user exists...');
    await fetch(baseUrl + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            nombres: "Test User",
            rol: "ADMIN"
        })
    }).catch(() => { }); // Ignore errors if already exists or other network issues for now

    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await fetch(baseUrl + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password
        })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.status, await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const accessToken = loginData.accessToken;

    if (!accessToken) {
        console.error('No access token in login response:', loginData);
        return;
    }
    console.log('Login successful. Token obtained.');

    // 2. Create Championship WITHOUT Token (Should fail)
    console.log('\n2. Attempting to create championship WITHOUT token...');
    const failRes = await fetch(baseUrl + '/campeonatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: "Test Championship No Auth",
            anio: 2025,
            fechaInicio: new Date().toISOString()
        })
    });
    console.log('Status (Should be 401):', failRes.status);
    const failBody = await failRes.text();
    console.log('Body:', failBody);

    // 3. Create Championship WITH Token (Should succeed)
    console.log('\n3. Attempting to create championship WITH token...');
    const successRes = await fetch(baseUrl + '/campeonatos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            nombre: "Test Championship With Auth",
            anio: 2025,
            fechaInicio: new Date().toISOString()
        })
    });
    console.log('Status (Should be 201):', successRes.status);
    const successBody = await successRes.text();
    console.log('Body:', successBody);
}

test();
