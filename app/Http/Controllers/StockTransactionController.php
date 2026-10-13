<?php

namespace App\Http\Controllers;

use App\Models\StockTransaction;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockTransactionController extends Controller
{
    use ApiResponse;

    /**
     * List all stock transactions with filters and pagination.
     *
     * Query params:
     *   product_id, type, date_from, date_to, reference, per_page, page
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockTransaction::with(['product', 'user', 'supplier'])
            ->orderByDesc('date')
            ->orderByDesc('id');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        if ($request->filled('reference')) {
            $query->where('reference', 'like', '%' . $request->reference . '%');
        }

        $perPage      = (int) $request->get('per_page', 15);
        $transactions = $query->paginate($perPage);

        return $this->success([
            'data'       => $transactions->items(),
            'pagination' => [
                'total'        => $transactions->total(),
                'per_page'     => $transactions->perPage(),
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
            ],
        ]);
    }

    /**
     * Show a single stock transaction with relations.
     */
    public function show(StockTransaction $stockTransaction): JsonResponse
    {
        $stockTransaction->load(['product', 'user', 'supplier']);

        return $this->success($stockTransaction);
    }
}
