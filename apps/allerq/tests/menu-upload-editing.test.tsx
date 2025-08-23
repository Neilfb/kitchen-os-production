import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuUploadPage from '../../src/app/menus/upload/page';
import MenuEditPage from '../../src/app/menus/[menuId]/edit/page';

// Mock fetch for API requests
global.fetch = jest.fn((url, options) => {
  if (url === '/api/menus/upload' && options?.method === 'POST') {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [
            { id: '1', name: 'Test Dish', allergens: ['nuts'], dietaryTags: ['vegan'] },
          ],
        }),
    } as Response);
  }
  if (url?.startsWith('/api/menus/') && options?.method === 'PUT') {
    return Promise.resolve({ ok: true } as Response);
  }
  return Promise.resolve({ ok: false } as Response);
});

describe('Menu Upload and Editing Flow', () => {
  it('uploads a menu file and displays extracted items with allergen and dietary tags', async () => {
    render(<MenuUploadPage />);
    const fileInput = screen.getByLabelText(/upload menu file/i);
    const file = new File(['dummy content'], 'menu.pdf', { type: 'application/pdf' });

    userEvent.upload(fileInput, file);

    // Wait for extracted items to appear
    await waitFor(() => {
      expect(screen.getByText('Test Dish')).toBeInTheDocument();
      expect(screen.getByText(/nuts/i)).toBeInTheDocument();
      expect(screen.getByText(/vegan/i)).toBeInTheDocument();
    });
  });

  it('handles upload API failure gracefully', async () => {
    // Override fetch to simulate failure
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: false } as Response)
    );

    render(<MenuUploadPage />);
    const fileInput = screen.getByLabelText(/upload menu file/i);
    const file = new File(['dummy content'], 'menu.pdf', { type: 'application/pdf' });

    userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });

  it('allows manual editing of menu items including allergen and dietary tags', async () => {
    // Mock initial menu data
    const menuId = '123';
    render(<MenuEditPage params={{ menuId }} />);

    // Wait for menu item to load
    await waitFor(() => {
      expect(screen.getByText('Test Dish')).toBeInTheDocument();
    });

    // Edit allergen tags
    const allergenInput = screen.getByLabelText(/allergens/i);
    fireEvent.change(allergenInput, { target: { value: 'gluten' } });

    // Edit dietary tags
    const dietaryInput = screen.getByLabelText(/dietary tags/i);
    fireEvent.change(dietaryInput, { target: { value: 'vegetarian' } });

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    userEvent.click(saveButton);

    // Expect API call and success indication
    await waitFor(() => {
      expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
    });
  });

  it('handles save API failure gracefully', async () => {
    // Override fetch to simulate failure on save
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: false } as Response)
    );

    const menuId = '123';
    render(<MenuEditPage params={{ menuId }} />);

    await waitFor(() => {
      expect(screen.getByText('Test Dish')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/save failed/i)).toBeInTheDocument();
    });
  });
});
