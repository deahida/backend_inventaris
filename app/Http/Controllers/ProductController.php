<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use ApiResponse;

    /**
     * List products with filters: search, category_id, status, condition.
     * Supports pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'supplier']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        $perPage = (int) $request->get('per_page', 15);
        $products = $query->orderBy('name')->paginate($perPage);

        return $this->success([
            'data'       => $products->items(),
            'pagination' => [
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
            ],
        ]);
    }

    /**
     * Create a product. Code is auto-generated.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['code'] = $this->generateCode();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);
        $product->load(['category', 'supplier']);

        return $this->created($this->format($product), 'Product created successfully');
    }

    /**
     * Show a single product.
     */
    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'supplier']);

        return $this->success($this->format($product));
    }

    /**
     * Update product. Preserves the auto-generated code.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        // Do not allow changing the product code via update
        unset($data['code']);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);
        $product->load(['category', 'supplier']);

        return $this->success($this->format($product->fresh()->load(['category', 'supplier'])), 'Product updated successfully');
    }

    /**
     * Delete a product.
     * Blocked at DB level if sale_items or stock_in_items reference it.
     */
    public function destroy(Product $product): JsonResponse
    {
        if ($product->saleItems()->exists()) {
            return $this->conflict('Cannot delete product because it has associated sales records.');
        }

        if ($product->stockInItems()->exists()) {
            return $this->conflict('Cannot delete product because it has associated stock-in records.');
        }

        if ($product->stockTransactions()->exists()) {
            return $this->conflict('Cannot delete product because it has stock transaction history.');
        }

        try {
            // Delete image from storage
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $product->delete();
        } catch (QueryException) {
            return $this->conflict('Cannot delete product: it is still referenced by other records.');
        }

        return $this->success(null, 'Product deleted successfully');
    }

    // -------------------------------------------------------------------------

    private function format(Product $product): array
    {
        return [
            'id'             => $product->id,
            'code'           => $product->code,
            'name'           => $product->name,
            'category_id'    => $product->category_id,
            'category'       => $product->category ? ['id' => $product->category->id, 'name' => $product->category->name] : null,
            'supplier_id'    => $product->supplier_id,
            'supplier'       => $product->supplier ? ['id' => $product->supplier->id, 'name' => $product->supplier->name] : null,
            'purchase_price' => (float) $product->purchase_price,
            'selling_price'  => (float) $product->selling_price,
            'stock'          => (int) $product->stock,
            'min_stock'      => (int) $product->min_stock,
            'condition'      => $product->condition,
            'status'         => $product->status,
            'description'    => $product->description,
            'image'          => $product->image ? Storage::disk('public')->url($product->image) : null,
            'created_at'     => $product->created_at,
            'updated_at'     => $product->updated_at,
        ];
    }

    private function generateCode(): string
    {
        $last = Product::orderByDesc('id')->value('code');
        $num  = 1;

        if ($last && preg_match('/PRD-(\d+)/', $last, $m)) {
            $num = (int) $m[1] + 1;
        }

        return 'PRD-' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }
}
