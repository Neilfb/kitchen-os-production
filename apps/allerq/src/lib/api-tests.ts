// Test the menu creation API locally in the context of the app
const testMenuCreation = async () => {
  try {
    // Create a menu
    const createResponse = await fetch('/api/menus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Menu ' + new Date().toISOString(),
        description: 'A test menu',
        tags: ['test', 'api']
      })
    });

    const createData = await createResponse.json();
    console.log('Menu creation response:', createData);
    
    if (createData.error) {
      console.error('Error creating menu:', createData.error);
    } else if (createData.menu) {
      console.log('Menu created successfully with ID:', createData.menu.id);
    }

    return createData;
  } catch (error) {
    console.error('Error during menu creation test:', error);
    return { error: error.message };
  }
};

// Export for later use
export { testMenuCreation };
