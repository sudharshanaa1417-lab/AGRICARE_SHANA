import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Filter, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { fetchMarketPrices } from '../services/api';
import { MarketCommodity } from '../types';

export const MarketPrices: React.FC = () => {
  const [data, setData] = useState<{ count: number; records: MarketCommodity[]; metadata: any; available_filters: any } | null>(null);
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrices();
  }, [stateFilter, districtFilter, commodityFilter]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const res = await fetchMarketPrices({
        state: stateFilter,
        district: districtFilter,
        commodity: commodityFilter
      });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="text-forest-700" size={24} />
          District-Wise Agricultural Market Prices
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Official APMC mandi arrivals, modal prices and agricultural marketing benchmarks
        </p>
      </div>

      {/* Authority Disclaimer Note */}
      <div className="bg-forest-50/70 border border-forest-200/60 rounded-3xl p-4 text-xs text-forest-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-extrabold block">Official Daily Mandi Gate Reports</span>
          <span className="text-forest-700 text-[11px]">
            Data synced from AGMARKNET / Directorate of Marketing & Inspection (DMI), Ministry of Agriculture.
          </span>
        </div>
        <span className="px-3 py-1 rounded-full bg-white text-forest-800 font-bold text-[10px] uppercase tracking-wide self-start sm:self-auto border border-forest-200">
          Daily Verified Report
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-forest-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 pb-1">
          <Filter size={15} className="text-forest-600" />
          Filter Mandi Records
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
            >
              <option value="">All States</option>
              {data?.available_filters?.states?.map((st: string) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">Commodity / Crop</label>
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
            >
              <option value="">All Commodities</option>
              {data?.available_filters?.commodities?.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">District Search</label>
            <div className="relative">
              <input
                type="text"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                placeholder="Search district e.g. Coimbatore"
                className="w-full px-3.5 py-2 pl-8 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Commodity Cards Grid */}
      {data && data.records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.records.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-forest-100/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
                    {item.state} • {item.district}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {item.arrival_date}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-gray-900 mt-1">
                  {item.commodity} ({item.variety})
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  Mandi: <strong>{item.market}</strong>
                </p>
              </div>

              {/* Price Display */}
              <div className="p-3.5 rounded-2xl bg-forest-50/50 border border-forest-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    Modal Price
                  </span>
                  <span className="text-2xl font-black font-mono text-forest-800">
                    ₹ {item.modal_price.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {item.unit}
                </span>
              </div>

              {/* Min & Max Price band */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-600">
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block font-medium">Min Price</span>
                  <span className="font-bold font-mono">₹ {item.min_price}</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block font-medium">Max Price</span>
                  <span className="font-bold font-mono">₹ {item.max_price}</span>
                </div>
              </div>

              {/* Footer source */}
              <div className="text-[10px] text-gray-400 border-t border-gray-100 pt-2 flex items-center justify-between">
                <span className="truncate max-w-[200px]">{item.source}</span>
                <span className="font-semibold text-forest-700">Verified</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-forest-100 shadow-xs space-y-3">
          <AlertCircle size={36} className="mx-auto text-amber-500" />
          <h3 className="text-sm font-bold text-gray-800">No Mandi Records Match Filters</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try choosing a different state or clear search keywords to browse active daily market commodity arrivals.
          </p>
        </div>
      )}
    </div>
  );
};
