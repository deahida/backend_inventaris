<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use App\Traits\ApiResponse;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    use ApiResponse;

    /**
     * List suppliers with optional status filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')->get();

        return $this->success($suppliers);
    }

    /**
     * Create supplier. Code is auto-generated.
     */
    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['code'] = $this->generateCode();

        $supplier = Supplier::create($data);

        return $this->created($supplier, 'Supplier created successfully');
    }

    public function show(Supplier $supplier): JsonResponse
    {
        return $this->success($supplier);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        $supplier->update($request->validated());

        return $this->success($supplier->fresh(), 'Supplier updated successfully');
    }

    /**
     * Delete supplier — blocked if products or stock_in_headers reference it.
     */
    public function destroy(Supplier $supplier): JsonResponse
    {
        if ($supplier->products()->exists()) {
            return $this->conflict('Cannot delete supplier because it has associated products.');
        }

        if ($supplier->stockInHeaders()->exists()) {
            return $this->conflict('Cannot delete supplier because it has associated stock-in records.');
        }

        try {
            $supplier->delete();
        } catch (QueryException) {
            return $this->conflict('Cannot delete supplier: it is still referenced by other records.');
        }

        return $this->success(null, 'Supplier deleted successfully');
    }

    // -------------------------------------------------------------------------

    /**
     * Generate the next unique supplier code: SUP-001, SUP-002, ...
     */
    private function generateCode(): string
    {
        $last = Supplier::orderByDesc('id')->value('code');
        $num  = 1;

        if ($last && preg_match('/SUP-(\d+)/', $last, $m)) {
            $num = (int) $m[1] + 1;
        }

        return 'SUP-' . str_pad($num, 3, '0', STR_PAD_LEFT);
    }
}
