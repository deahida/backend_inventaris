import React, {
  useEffect,
} from 'react';

import {
  useParams,
  useNavigate,
} from 'react-router';

import {
  formatCurrency,
} from '@/utils';

import { useInventory } from '@/contexts/useInventory';

export default function Receipt() {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate =
    useNavigate();

  const {
    sales,
  } = useInventory();

  /*
   * Cari transaksi.
   */

  const sale =
    sales.find(
      (item) =>
        item.id ===
        Number(id)
    );

  /*
   * Auto print.
   */

  useEffect(() => {
    if (!sale) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          window.print();
        },
        500
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [sale]);

  /*
   * Tidak ditemukan.
   */

  if (!sale) {
    return (
      <div className="p-8 text-center">
        Transaksi tidak
        ditemukan.

        <br />

        <button
          type="button"
          className="text-indigo-600 underline mt-4"
          onClick={() =>
            navigate(-1)
          }
        >
          Kembali
        </button>
      </div>
    );
  }

  /*
   * Format tanggal.
   */

  const dateObj =
    new Date(
      sale.date
    );

  const formattedDate =
    dateObj.toLocaleDateString(
      'id-ID',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    ) +
    ' ' +
    dateObj.toLocaleTimeString(
      'id-ID',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  /*
   * ==========================================================
   * RENDER RECEIPT
   * ==========================================================
   */

  return (
    <div className="bg-white min-h-screen p-4 flex justify-center print:p-0 print:bg-transparent">
      <div className="w-[300px] text-black font-mono text-sm leading-tight print:w-full">
        {/* HEADER */}

        <div className="text-center mb-4">
          <h1 className="font-bold text-xl mb-1">
            PRO.COM STORE
          </h1>

          <p className="text-xs">
            Jl. Komputer
            Raya No. 123
          </p>

          <p className="text-xs">
            Telp:
            0812-3456-7890
          </p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* INFO */}

        <div className="text-xs mb-2">
          <div className="flex justify-between">
            <span>
              No:
            </span>

            <span>
              {
                sale.invoice
              }
            </span>
          </div>

          <div className="flex justify-between">
            <span>
              Tgl:
            </span>

            <span>
              {
                formattedDate
              }
            </span>
          </div>

          <div className="flex justify-between">
            <span>
              Ksr:
            </span>

            <span>
              {
                sale.cashierName
              }
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* ITEMS */}

        <div className="mb-2">
          {sale.items.map(
            (item) => (
              <div
                key={`${sale.id}-${item.productId}`}
                className="mb-2"
              >
                <div className="text-xs break-words">
                  {
                    item.productName
                  }
                </div>

                <div className="flex justify-between text-xs">
                  <span>
                    {
                      item.quantity
                    }{' '}
                    x{' '}
                    {formatCurrency(
                      item.unitPrice
                    )
                      .replace(
                        'Rp',
                        ''
                      )
                      .trim()}
                  </span>

                  <span>
                    {formatCurrency(
                      item.subtotal
                    )
                      .replace(
                        'Rp',
                        ''
                      )
                      .trim()}
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* TOTAL */}

        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>
              Subtotal
            </span>

            <span>
              {formatCurrency(
                sale.subtotal
              )
                .replace(
                  'Rp',
                  ''
                )
                .trim()}
            </span>
          </div>

          {sale.discount >
            0 && (
            <div className="flex justify-between">
              <span>
                Diskon
              </span>

              <span>
                -
                {formatCurrency(
                  sale.discount
                )
                  .replace(
                    'Rp',
                    ''
                  )
                  .trim()}
              </span>
            </div>
          )}

          {sale.tax >
            0 && (
            <div className="flex justify-between">
              <span>
                Pajak
              </span>

              <span>
                {formatCurrency(
                  sale.tax
                )
                  .replace(
                    'Rp',
                    ''
                  )
                  .trim()}
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-dashed border-gray-400">
            <span>
              TOTAL
            </span>

            <span>
              {formatCurrency(
                sale.total
              )
                .replace(
                  'Rp',
                  ''
                )
                .trim()}
            </span>
          </div>

          <div className="flex justify-between mt-1">
            <span>
              Bayar
            </span>

            <span>
              {formatCurrency(
                sale.paymentAmount
              )
                .replace(
                  'Rp',
                  ''
                )
                .trim()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>
              Kembali
            </span>

            <span>
              {formatCurrency(
                sale.change
              )
                .replace(
                  'Rp',
                  ''
                )
                .trim()}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* FOOTER */}

        <div className="text-center text-xs mt-4">
          <p>
            Terima kasih atas
            kunjungan Anda
          </p>

          <p>
            Barang yang sudah
            dibeli tidak dapat
            ditukar/dikembalikan
          </p>
        </div>

        {/* CONTROLS */}

        <div className="mt-8 flex justify-center gap-4 print:hidden">
          <button
            type="button"
            className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
            onClick={() =>
              navigate(-1)
            }
          >
            Kembali
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            onClick={() =>
              window.print()
            }
          >
            Cetak Lagi
          </button>
        </div>
      </div>
    </div>
  );
}