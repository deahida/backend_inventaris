<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * List all categories with product_count.
     * The frontend displays product_count on the category list.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => $this->format($c));

        return $this->success($categories);
    }

    /**
     * Create a new category.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return $this->created($this->format($category->loadCount('products')), 'Category created successfully');
    }

    /**
     * Show a single category with its product_count.
     */
    public function show(Category $category): JsonResponse
    {
        $category->loadCount('products');

        return $this->success($this->format($category));
    }

    /**
     * Update a category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());

        return $this->success($this->format($category->fresh()->loadCount('products')), 'Category updated successfully');
    }

    /**
     * Delete a category.
     * Blocked at the DB level if products reference this category (restrictOnDelete).
     */
    public function destroy(Category $category): JsonResponse
    {
        // Check before attempting — gives a human-readable error rather than a DB exception
        if ($category->products()->exists()) {
            return $this->conflict('Cannot delete category because it has associated products.');
        }

        try {
            $category->delete();
        } catch (QueryException) {
            return $this->conflict('Cannot delete category: it is still referenced by products.');
        }

        return $this->success(null, 'Category deleted successfully');
    }

    // -------------------------------------------------------------------------

    private function format(Category $category): array
    {
        return [
            'id'            => $category->id,
            'name'          => $category->name,
            'description'   => $category->description,
            'product_count' => $category->products_count ?? 0,
            'created_at'    => $category->created_at,
            'updated_at'    => $category->updated_at,
        ];
    }
}
