// Initialize Supabase client
const supabaseUrl = 'https://dvsoyesscauzsirtjthh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2c295ZXNzY2F1enNpcnRqdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzNTU4NDQsImV4cCI6MjAyOTkzMTg0NH0.3HoGdobfXm7-SJtRSVF7R9kraDNHBFsiEaJunMjwpHk';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch and display disabled pages
async function fetchDisabledPages() {
  const { data: pages, error } = await supabaseClient
    .from('disabled_pages')
    .select('page_name');

  if (error) {
    console.error('Error fetching disabled pages:', error.message);
    return;
  }

  const list = document.getElementById('disabled-pages-list');
  list.innerHTML = ''; // Clear previous list items

  pages.forEach(page => {
    const listItem = document.createElement('li');
    listItem.textContent = page.page_name;

    // Add delete button to re-enable page
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.addEventListener('click', async () => {
      await supabaseClient
        .from('disabled_pages')
        .delete()
        .eq('page_name', page.page_name);
      
      fetchDisabledPages(); // Refresh disabled pages list after deletion
    });

    listItem.appendChild(deleteButton);
    list.appendChild(listItem);
  });
}

// Function to handle form submission
document.getElementById('add-page-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const pageSelect = document.getElementById('page-select');
  const pageName = pageSelect.value.trim();

  if (!pageName) {
    alert('Please select a page.');
    return;
  }

  // Check if page already exists in disabled_pages
  const { data: existingPage } = await supabaseClient
    .from('disabled_pages')
    .select('id')
    .eq('page_name', pageName)
    .single();

  if (existingPage) {
    alert('Page is already disabled.');
    return;
  }

  // Insert new disabled page into disabled_pages table
  const { data, error } = await supabaseClient
    .from('disabled_pages')
    .insert({ page_name: pageName });

  if (error) {
    console.error('Error inserting page:', error.message);
    return;
  }

  // Clear and refresh disabled pages list
  pageSelect.value = ''; // Reset dropdown
  fetchDisabledPages(); // Refresh disabled pages list
});

// Function to redirect if current page is disabled
async function checkPageAccess() {
  const currentPage = window.location.pathname.split('/').pop();
  const { data: disabledPage } = await supabaseClient
    .from('disabled_pages')
    .select('page_name')
    .eq('page_name', currentPage)
    .single();

  if (disabledPage) {
    window.location.href = '/redirect.html'; // Redirect to redirect.html
  }
}

// Run checkPageAccess() on page load
checkPageAccess();
