import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useMemo, useDeferredValue, useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Package,
  Heart,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Map as MapIcon,
  Search as SearchIcon,
} from "lucide-react";
import { useApiClient } from "@/hooks/useApiClient";
import type { Asset, Maintenance } from "@/lib/Types";
import { HomeSkeleton } from "@/components/HomeSkeleton";
import { optimizeImageUrl } from "@/lib/images";
import { StackedCarousel } from "@/components/StackedCarousel";
import { BorrowableAssetCard } from "@/components/BorrowableAssetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

type MaintenanceStatus = "overdue" | "pending" | "completed";
type MaintenanceWithStatus = Maintenance & { status: MaintenanceStatus };

const SUGGESTED_QUERIES = ["camping gear", "power tools", "cameras", "projectors"];

function RouteComponent() {
  const { user, isLoaded, isSignedIn } = useUser();
  const apiClient = useApiClient();
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const normalizedSearch = deferredSearch.trim();
  const hasActiveSearch = normalizedSearch.length > 0;

  const greeting = useMemo(() => {
    const greetings = [
      "Hello",
      "Welcome back",
      "Hi there",
      "Hey",
      "Greetings",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, []);

  // Data Fetching

  const assetsQuery = useQuery<Asset[]>({
    queryKey: ["assets", "community", user?.id ?? "guest", normalizedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        scope: "community",
        limit: "100",
      });
      if (normalizedSearch) {
        params.set("search", normalizedSearch);
      }
      return apiClient<Asset[]>(`/assets?${params.toString()}`);
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData,
  });
  const assets = assetsQuery.data ?? [];

  const myAssetsQuery = useQuery<Asset[]>({
    queryKey: ["assets", "mine", user?.id ?? "guest"],
    queryFn: async () => {
      if (!user) return [];
      return apiClient<Asset[]>("/assets");
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData,
  });
  const myAssets = myAssetsQuery.data ?? [];

  const communityAssets = useMemo(
    () =>
      assets.filter((asset) => asset.ownerUserId !== user?.id),
    [assets, user?.id],
  );

  const filteredCommunityAssets = useMemo(() => {
    if (!hasActiveSearch) {
      return communityAssets;
    }

    const query = normalizedSearch.toLowerCase();
    return communityAssets.filter((asset) => {
      const fields = [asset.itemName, asset.brandName, asset.category, asset.currentLocation];
      return fields.some((value) => value?.toLowerCase().includes(query));
    });
  }, [communityAssets, hasActiveSearch, normalizedSearch]);

  const maintenanceQuery = useQuery<Maintenance[], Error, MaintenanceWithStatus[]>({
    queryKey: ["maintenance", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return apiClient<Maintenance[]>("/maintenance");
    },
    enabled: !!user,
    select: (data) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return data.map<MaintenanceWithStatus>((task) => {
        let status: MaintenanceStatus;
        if (task.isCompleted) {
          status = "completed";
        } else {
          const dueDate = new Date(task.maintenanceDueDate);
          dueDate.setHours(0, 0, 0, 0);
          status = dueDate < now ? "overdue" : "pending";
        }
        return { ...task, status };
      });
    },
    placeholderData: (previousData) => previousData,
  });
  const maintenanceTasks = maintenanceQuery.data ?? [];

  // Derived State
  const formatStatus = (value?: string | null) => {
    if (!value) return undefined;
    return value
      .toString()
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const hasAssetsData = assetsQuery.data !== undefined;
  const hasMyAssetsData = myAssetsQuery.data !== undefined;
  const hasMaintenanceData = maintenanceQuery.data !== undefined;
  const isInitialLoading =
    !isLoaded ||
    (!hasAssetsData && assetsQuery.status === "pending") ||
    (!hasMyAssetsData && myAssetsQuery.status === "pending") ||
    (!hasMaintenanceData && maintenanceQuery.status === "pending");
  const overdueItems = maintenanceTasks.filter(
    (item) => item.status === "overdue",
  );
  const upcomingItems = maintenanceTasks
    .filter(
      (item) => item.status === "pending" || item.status === "overdue",
    )
    .sort(
      (a, b) =>
        new Date(a.maintenanceDueDate).getTime() -
        new Date(b.maintenanceDueDate).getTime(),
    )
    .slice(0, 5); // Cap the list to the top 5
  const showcaseAsset = useMemo(
    () => communityAssets[0] ?? null,
    [communityAssets],
  );

  const locationSummary = useMemo(() => {
    const counts = new Map<string, { count: number; sample?: Asset }>();
    for (const asset of myAssets) {
      if (!asset.currentLocation) continue;
      const entry = counts.get(asset.currentLocation);
      if (entry) {
        entry.count += 1;
      } else {
        counts.set(asset.currentLocation, { count: 1, sample: asset });
      }
    }
    return Array.from(counts.entries())
      .map(([location, info]) => ({ location, ...info }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [myAssets]);

  const searchPool = hasActiveSearch ? filteredCommunityAssets : communityAssets;

  const spotlightAssets = useMemo(() => {
    if (communityAssets.length === 0) return [];
    return [...communityAssets]
      .sort(
        (a, b) => (b.purchaseCost ?? 0) - (a.purchaseCost ?? 0),
      )
      .slice(0, 4);
  }, [communityAssets]);

  const searchResults = useMemo(
    () => searchPool.slice(0, hasActiveSearch ? 12 : 9),
    [searchPool, hasActiveSearch],
  );
  const remainingResults = Math.max(searchPool.length - searchResults.length, 0);

  const mapUrl = useMemo(() => {
    if (!mapsApiKey) return null;
    const targetLocation = locationSummary[0]?.location ?? showcaseAsset?.currentLocation;
    if (!targetLocation) return null;
    return `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(
      targetLocation,
    )}`;
  }, [showcaseAsset, locationSummary]);

  // Overdue Items Toast Notification
  useEffect(() => {
    const toastId = "overdue-toast";
    const overdueItemsLength = overdueItems.length;
    if (!isInitialLoading && overdueItemsLength > 0) {
      toast(
        (t) => (
          <div className="flex items-center justify-between w-full">
            <Link
              to="/maintenance"
              search={{ filter: "overdue" }}
              onClick={() => toast.dismiss(t.id)}
              className="flex items-center text-inherit no-underline"
            >
              <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-yellow-500" />
              <div className="flex flex-col">
                <p className="font-bold text-yellow-800">
                  {overdueItemsLength} Maintenance Item
                  {overdueItemsLength > 1 ? "s are" : " is"} Overdue
                </p>
                <p className="text-sm text-yellow-700">
                  Click here to address these items.
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="p-1 rounded-full hover:bg-yellow-200 transition-colors ml-4 flex-shrink-0"
            >
              <X className="h-5 w-5 text-yellow-800" />
            </button>
          </div>
        ),
        {
          id: toastId,
          duration: Number.POSITIVE_INFINITY,
          style: {
            background: "#FFFBEB", // bg-yellow-50
            border: "1px solid #FBBF24", // border-yellow-400
          },
        }
      );
    }
    return () => {
      toast.dismiss(toastId);
    };
  }, [isInitialLoading, overdueItems.length]);

  // Helper function for status styling
  const getStatusClasses = (status: "overdue" | "pending" | "completed") => {
    switch (status) {
      case "overdue":
        return "border border-red-400/30 bg-red-500/15 text-red-200";
      case "pending":
        return "border border-amber-300/30 bg-amber-400/15 text-amber-200";
      default:
        return "border border-white/15 bg-white/10 text-white/70";
    }
  };

  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (isInitialLoading) {
    return <HomeSkeleton />;
  }

  const carouselItems = communityAssets.slice(0, 7);
  const borrowerHighlights = [
    {
      title: "Reserve instantly",
      description: "Tap borrow and lock in community gear for the weekend in seconds.",
    },
    {
      title: "Stay covered",
      description: "Owners share care guides so returns are effortless and stress free.",
    },
    {
      title: "Zero clutter",
      description: "Borrow what you need, when you need it—then give it back.",
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900 text-white">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-5xl rounded-b-[50%] bg-primary-yellow/20 blur-[120px]" />
        <PageContainer as="div" className="relative space-y-12 pt-10">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-900/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0">
                <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-primary-yellow/30 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary-yellow/15 blur-[120px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_55%)]" />
              </div>
              <div className="relative grid gap-12 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:px-14">
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
                      Don&apos;t buy, borrow
                    </span>
                    <div className="space-y-3">
                      <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                        {greeting}, {user?.firstName}
                      </h1>
                      <p className="max-w-xl text-base text-white/70 sm:text-lg">
                        Tap into your neighborhood library of gear. Discover what&apos;s available, reserve it for the weekend, and return it when you&apos;re done.
                      </p>
                      <p className="max-w-xl text-sm text-white/60">
                        Then jump into the search below to filter the exchange and find the perfect match.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to="/assets/my-assets"
                      className="inline-flex items-center gap-2 rounded-full bg-primary-yellow px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-primary-yellow/80"
                    >
                      Share something new
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/maintenance"
                      search={{ filter: "all" }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white/80 transition hover:text-white"
                    >
                      Track my upkeep
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    {!hasActiveSearch && communityAssets.length === 0 && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                        No community listings yet
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {borrowerHighlights.map(({ title, description }) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-primary-yellow/40 hover:bg-white/10"
                      >
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-xs text-white/60">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-xl">
                    <div className="absolute -inset-10 rounded-[2.75rem] bg-primary-yellow/20 blur-[100px]" />
                    <StackedCarousel
                      items={carouselItems.length > 0 ? carouselItems : showcaseAsset ? [showcaseAsset] : []}
                      renderCard={(asset) => (
                        <BorrowableAssetCard
                          id={asset.id}
                          itemName={asset.itemName}
                          brandName={asset.brandName}
                          images={asset.images}
                          currentLocation={asset.currentLocation}
                          status={formatStatus(asset.status)}
                          canRequest={asset.ownerUserId !== user?.id}
                        />
                      )}
                    />
                    {carouselItems.length === 0 && !showcaseAsset && (
                      <div className="flex h-72 w-full items-center justify-center rounded-[2rem] border border-white/15 bg-white/5 text-white/60">
                        <Package className="h-16 w-16" />
                        <span className="ml-4 text-sm">Share an asset to feature lending opportunities.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Search results */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_40px_80px_-45px_rgba(15,23,42,0.9)] sm:p-8">
              <div className="space-y-5">
                <div className="relative w-full sm:max-w-2xl">
                  <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search for camera gear, lawn tools, audio rigs…"
                    className="h-14 rounded-full border border-white/15 bg-white/10 pl-14 pr-6 text-base text-white placeholder:text-white/30 shadow-[0_18px_45px_-25px_rgba(250,204,21,0.45)] focus:border-primary-yellow/60 focus:ring-0"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/50">Suggested</span>
                  {SUGGESTED_QUERIES.map((term) => (
                    <Button
                      key={term}
                      type="button"
                      variant="ghost"
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70 transition hover:border-primary-yellow/50 hover:bg-primary-yellow/10 hover:text-white"
                      onClick={() => setSearchTerm(term)}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-white sm:text-2xl">
                      {hasActiveSearch ? "Search results" : "Fresh from the exchange"}
                    </h2>
                    <p className="text-sm text-white/60">
                    {hasActiveSearch
                      ? searchPool.length > 0
                        ? `Found ${searchPool.length} gear match${searchPool.length === 1 ? "" : "es"} ready to borrow.`
                        : `Nothing yet for "${normalizedSearch}". Try a different keyword or suggested search.`
                      : "Browse what neighbors recently listed and grab something for your next project."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {assetsQuery.isFetching && !isInitialLoading && (
                      <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">
                        Updating…
                      </span>
                    )}
                  {!hasActiveSearch && communityAssets.length > 0 && (
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                      {communityAssets.length} listed now
                    </span>
                  )}
                </div>
              </div>
              </div>
              {searchResults.length > 0 ? (
                <>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {searchResults.map((asset) => (
                      <BorrowableAssetCard
                        key={asset.id}
                        id={asset.id}
                        itemName={asset.itemName}
                        brandName={asset.brandName}
                        images={asset.images}
                        currentLocation={asset.currentLocation}
                        status={formatStatus(asset.status)}
                        availabilityText={
                          asset.status && asset.status.toString().toLowerCase() === "available"
                            ? "Available now"
                            : undefined
                        }
                        canRequest={asset.ownerUserId !== user?.id}
                      />
                    ))}
                  </div>
                  {remainingResults > 0 && (
                    <p className="mt-6 text-sm text-white/60">
                      +{remainingResults} more match{remainingResults === 1 ? "" : "es"} available — refine your search to narrow it down.
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-white/60">
                  {hasActiveSearch
                    ? "No matches yet. Try another keyword, a broader category, or clear your search."
                    : "Community assets will appear here as soon as someone shares them."}
                </div>
              )}
            </section>

          {/* Overview + favorites */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr,0.7fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)] sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">Upcoming Maintenance</h2>
                <Link
                  to="/maintenance"
                  search={{ filter: "all" }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-yellow/80 transition hover:text-primary-yellow"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingItems.length > 0 ? (
                  upcomingItems.map((item) => (
                    <Link
                      to="/assets/my-assets/$id"
                      params={{ id: item.assetId }}
                      key={item.id}
                      className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-primary-yellow/40 hover:bg-white/10 hover:shadow-xl sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-4 sm:items-center">
                        <div className={`rounded-full p-2 ${getStatusClasses(item.status)}`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-white">{item.maintenanceTitle}</p>
                          <p className="text-sm text-white/60">{item.productName ?? ""}</p>
                        </div>
                      </div>
                    <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusClasses(item.status)}`}
                        >
                          {new Date(item.maintenanceDueDate).toLocaleDateString()}
                        </span>
                        <ChevronRight className="h-4 w-4 text-white/30 transition group-hover:text-primary-yellow" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-white/60">No upcoming maintenance items. You&apos;re all caught up!</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)] sm:p-8">
              <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">Community Spotlight</h2>
              <div className="space-y-3">
                {spotlightAssets.length > 0 ? (
                  spotlightAssets.map((asset) => (
                    <Link
                      to="/assets/my-assets/$id"
                      params={{ id: asset.id }}
                      key={asset.id}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-primary-yellow/40 hover:bg-white/10 hover:shadow-xl"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/20 bg-white/10">
                        {asset.images?.[0] ? (
                          <img
                            src={optimizeImageUrl(asset.images[0], 300)}
                            alt={asset.itemName}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/30">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{asset.itemName}</p>
                        <p className="text-sm text-white/60">{asset.brandName ?? "Unbranded"}</p>
                      </div>
                      <Heart className="h-5 w-5 text-primary-yellow" />
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-white/60">
                    {hasActiveSearch
                      ? "No matches yet. Try adjusting your search."
                      : "Community assets will appear here as soon as they’re shared."}
                  </div>
                )}
              </div>
            </div>
          </section>

            {/* Map + locations */}
            <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_45px_90px_-50px_rgba(15,23,42,0.9)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
                <div className="rounded-full bg-primary-yellow/20 p-2 text-primary-yellow">
                  <MapIcon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Where you&apos;ve stored gear</h3>
              </div>
              <div className="relative h-[320px] overflow-hidden rounded-[2.5rem] border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-yellow/20 via-transparent to-transparent" />
                {mapUrl ? (
                  <iframe
                    key={mapUrl}
                    title="Asset locations"
                    src={mapUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/50">
                    Add a Google Maps API key to visualize asset locations.
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.9)] sm:p-8">
              <h3 className="mb-4 text-lg font-semibold text-white">Storage locations</h3>
              {locationSummary.length > 0 ? (
                <ul className="space-y-3">
                  {locationSummary.map(({ location, count, sample }) => (
                    <li key={location}>
                      {sample ? (
                        <Link
                          to="/assets/my-assets/$id"
                          params={{ id: sample.id }}
                          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-primary-yellow/40 hover:bg-white/10 hover:shadow-xl"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-yellow/20 text-primary-yellow">
                            {count}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{location}</p>
                            <p className="text-sm text-white/60">
                              {count} asset{count > 1 ? "s" : ""} stored here
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-white/30 transition group-hover:text-primary-yellow" />
                        </Link>
                      ) : (
                        <Link
                          to="/assets/my-assets"
                          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-primary-yellow/40 hover:bg-white/10 hover:shadow-xl"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-yellow/20 text-primary-yellow">
                            {count}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{location}</p>
                            <p className="text-sm text-white/60">
                              {count} asset{count > 1 ? "s" : ""} stored here
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-white/30 transition group-hover:text-primary-yellow" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-white/60">
                  Add location information to your assets to see them plotted on the map.
                </div>
              )}
            </div>
          </section>
        </PageContainer>
      </main>
    </div>
  );
}
