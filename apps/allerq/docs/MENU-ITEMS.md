# Menu Items Feature Documentation

## Overview
The menu items functionality allows restaurant owners to create, update, delete, and reorder menu items for their digital menus. This document explains how the menu items functionality works and how to test it.

## Key Components

### API Endpoints

1. **GET /api/menus/[id]/items**
   - Retrieves all menu items for a specific menu
   - Returns a JSON object with an `items` array

2. **POST /api/menus/[id]/items**
   - Creates a new menu item for a specific menu
   - Accepts JSON with item details (name, description, price, etc.)
   - Returns the created item with a unique ID

3. **PUT /api/menus/[id]/items/[itemId]**
   - Updates an existing menu item
   - Accepts JSON with updated item details
   - Returns the updated item

4. **DELETE /api/menus/[id]/items/[itemId]**
   - Deletes a specific menu item
   - Returns success status

5. **POST /api/menus/[id]/items/reorder**
   - Reorders menu items
   - Accepts a JSON array of items with ID and order properties
   - Returns success status

6. **POST /api/menus/[id]/items/bulk**
   - Performs bulk actions (delete, move, updateCategory, reorder)
   - Accepts JSON with action details
   - Returns success status

### Frontend Components

1. **MenuItemsPage.tsx**
   - The main component for displaying and managing menu items
   - Handles CRUD operations for menu items

2. **MenuItemEditor.tsx**
   - Form component for creating and editing menu items
   - Handles validation and submission

3. **MenuItemReorder.tsx**
   - Drag-and-drop interface for reordering menu items
   - Uses react-dnd for drag-and-drop functionality
   - Saves new order to the backend

## How to Test

### API Testing

1. **Test Getting Menu Items**
   ```bash
   curl -X GET http://localhost:3000/api/menus/test-menu-id/items
   ```
   Expected result: Returns an array of menu items

2. **Test Creating a Menu Item**
   ```bash
   curl -X POST http://localhost:3000/api/menus/test-menu-id/items \
   -H "Content-Type: application/json" \
   -d '{"name":"Test Dish", "description": "A test dish", "price": 10.99, "allergens": ["gluten"]}'
   ```
   Expected result: Returns the created item with an ID

3. **Test Reordering Menu Items**
   ```bash
   curl -X POST http://localhost:3000/api/menus/test-menu-id/items/reorder \
   -H "Content-Type: application/json" \
   -d '{"items":[{"id":"item-1","order":1},{"id":"item-2","order":0}]}'
   ```
   Expected result: Returns success status

4. **Test Bulk Actions**
   ```bash
   curl -X POST http://localhost:3000/api/menus/test-menu-id/items/bulk \
   -H "Content-Type: application/json" \
   -d '{"ids":["item-1","item-2"],"action":"reorder","data":{"order":["item-2","item-1"]}}'
   ```
   Expected result: Returns success status

### UI Testing

1. **Menu Item Creation**
   - Navigate to a menu's items page
   - Click "Add Item"
   - Fill in the form and submit
   - Verify the new item appears in the list

2. **Menu Item Reordering**
   - Navigate to a menu's items page
   - Click "Reorder Items"
   - Drag items to change their order
   - Click "Save Order"
   - Verify the new order is saved and displayed correctly

## Troubleshooting

### Common Issues

1. **API Returns 404 Error**
   - Check that the menu ID is correct
   - Verify that the API server is running

2. **Reordering Doesn't Save**
   - Check browser console for errors
   - Verify the menu items have unique IDs
   - Check that the API is correctly processing the reorder request

3. **Items Not Displaying in UI**
   - Check if the items array is empty or undefined
   - Verify that GET request is successful
   - Check for filtering logic that might hide items

## Recent Fixes (May 25, 2025)

1. Fixed API URL construction in the backend for menu item operations
2. Added proper error handling and logging for API requests
3. Implemented robust demo mode for testing without backend dependency
4. Fixed menu item reordering functionality to properly update item orders
5. Added comprehensive testing tools to verify API functionality

## Development Notes

- The menu items functionality uses the Next.js App Router for API routes
- All menu items are stored in the "menuItems" collection in the NoCodeBackend
- The API supports filtering items by category
- Reordering uses a zero-based index system for item ordering
