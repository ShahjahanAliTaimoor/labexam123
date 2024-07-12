document.getElementById('vehicleForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const formData = new FormData(this);
    const formDataObj = Object.fromEntries(formData.entries());
  
    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObj),
      });
  
      if (response.ok) {
        alert('Details submitted successfully!');
        this.reset();
      } else {
        alert('Failed to submit details');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit details');
    }
  });
  