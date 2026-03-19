"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

type Attachment = { name: string; url: string };
type QnaItem = {
  question: string;
  askedBy: string;
  date: string;
  answer: string;
};

type Props = {
  description: string;
  features: string[];
  packageIncludes: string[];
  specifications: Record<string, string>;
  attachments: Attachment[];
  videoUrl: string | null;
  qna: QnaItem[];
  otherInfo: {
    origin?: string;
    importBy?: string;
    address?: string;
    customerCare?: {
      phone?: string;
      email?: string;
    };
  } | null;
};

type TabValue =
  | "description"
  | "specification"
  | "reviews"
  | "attachments"
  | "videos"
  | "qna"
  | "other-info";

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    return "";
  } catch {
    return "";
  }
}

export default function ProductDetailTabs({
  description,
  features,
  packageIncludes,
  specifications,
  attachments,
  videoUrl,
  qna,
  otherInfo,
}: Props) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabValue>("description");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [votes, setVotes] = useState<number[]>(() => qna.map(() => 0));
  const [expandedAnswers, setExpandedAnswers] = useState<
    Record<number, boolean>
  >({});

  const descriptionParagraphs = useMemo(
    () =>
      description
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
    [description],
  );

  const reviewStats = {
    overall: 4.2,
    count: 38,
    breakdown: [
      { stars: 5, percent: 64, count: 24 },
      { stars: 4, percent: 21, count: 8 },
      { stars: 3, percent: 8, count: 3 },
      { stars: 2, percent: 5, count: 2 },
      { stars: 1, percent: 2, count: 1 },
    ],
  };

  const mockReviews = [
    {
      name: "Arjun K.",
      rating: 5,
      date: "2026-03-12",
      text: "Great packaging and exactly as described. Used this in a line follower project and it worked out of the box.",
    },
    {
      name: "Priya S.",
      rating: 4,
      date: "2026-03-08",
      text: "Fast shipping and genuine part. Documentation could be more detailed but overall very good product.",
    },
    {
      name: "Dev R.",
      rating: 4,
      date: "2026-02-28",
      text: "Solid build quality for the price. Bought two units for prototyping and both are functioning well.",
    },
  ];

  return (
    <section className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-2 border-b border-border p-0 pb-3"
        >
          <TabsTrigger
            value="description"
            className="rounded-sm border border-border px-3 py-2"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="specification"
            className="rounded-sm border border-border px-3 py-2"
          >
            Specification
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-sm border border-border px-3 py-2"
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="attachments"
            className="rounded-sm border border-border px-3 py-2"
          >
            Attachments
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="rounded-sm border border-border px-3 py-2"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="qna"
            className="rounded-sm border border-border px-3 py-2"
          >
            QnA
          </TabsTrigger>
          <TabsTrigger
            value="other-info"
            className="rounded-sm border border-border px-3 py-2"
          >
            Other Info
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-sm border border-border p-4 md:p-5">
        {activeTab === "description" ? (
          <div className="space-y-6">
            <div className="space-y-3">
              {descriptionParagraphs.map((paragraph, index) => (
                <p
                  key={`desc-${index}`}
                  className="text-sm leading-7 text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Features</h3>
              {features.length ? (
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  {features.map((item, index) => (
                    <li key={`feature-${index}`}>{item}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No features listed.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Package Includes</h3>
              {packageIncludes.length ? (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {packageIncludes.map((item, index) => (
                    <li key={`package-${index}`}>- {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No package details listed.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "specification" ? (
          <div>
            {Object.keys(specifications).length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {Object.entries(specifications).map(
                      ([key, value], index) => (
                        <tr
                          key={key}
                          className={
                            index % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                          }
                        >
                          <td className="w-[40%] border border-border px-3 py-2 font-medium">
                            {key}
                          </td>
                          <td className="border border-border px-3 py-2 text-muted-foreground">
                            {value}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specifications listed.
              </p>
            )}
          </div>
        ) : null}

        {activeTab === "reviews" ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-sm border border-border p-4">
                <div className="space-y-1">
                  <p className="text-4xl font-semibold">
                    {reviewStats.overall.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Overall Rating
                  </p>
                </div>
                <div className="space-y-3">
                  {reviewStats.breakdown.map((row) => (
                    <div
                      key={row.stars}
                      className="grid grid-cols-[44px_1fr_42px] items-center gap-3"
                    >
                      <span className="text-sm text-muted-foreground">
                        {row.stars}★
                      </span>
                      <Progress value={row.percent} />
                      <span className="text-xs text-muted-foreground">
                        {row.count}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {reviewStats.count} reviews
                </p>
              </div>

              <div className="space-y-4 rounded-sm border border-border p-4">
                <h3 className="text-sm font-semibold">Write a Review</h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const filled = value <= (hoverRating || reviewRating);
                    return (
                      <button
                        key={value}
                        type="button"
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(value)}
                        aria-label={`Rate ${value} stars`}
                      >
                        <Star
                          className={`size-5 ${filled ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
                        />
                      </button>
                    );
                  })}
                </div>
                <Textarea
                  placeholder="Share your experience"
                  className="rounded-sm"
                />
                <Input placeholder="Name" className="rounded-sm" />
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-sm"
                />
                <Button
                  type="button"
                  className="rounded-sm"
                  onClick={() => {
                    toast({
                      title: "Submitted",
                      description: "Review submitted for moderation.",
                    });
                  }}
                >
                  Submit Review
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {mockReviews.map((review, index) => (
                <div
                  key={`review-${index}`}
                  className="rounded-sm border border-border p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{review.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                  <div className="mb-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`size-4 ${
                          starIndex < review.rating
                            ? "fill-foreground text-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "attachments" ? (
          <div className="space-y-3">
            {attachments.length ? (
              attachments.map((item, index) => (
                <div
                  key={`attachment-${index}`}
                  className="flex items-center justify-between gap-2 rounded-sm border border-border px-3 py-2"
                >
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                  <Button
                    asChild
                    variant="outline"
                    className="h-8 rounded-sm px-3 text-xs"
                  >
                    <a href={item.url || "#"}>DOWNLOAD</a>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No attachments available.
              </p>
            )}
          </div>
        ) : null}

        {activeTab === "videos" ? (
          <div>
            {videoUrl && youtubeEmbedUrl(videoUrl) ? (
              <div className="aspect-video w-full overflow-hidden rounded-sm border border-border">
                <iframe
                  src={youtubeEmbedUrl(videoUrl)}
                  title="Product video"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No videos available for this product.
              </p>
            )}
          </div>
        ) : null}

        {activeTab === "qna" ? (
          <div className="space-y-3">
            {qna.length ? (
              qna.map((item, index) => {
                const isExpanded = expandedAnswers[index] ?? false;
                return (
                  <div
                    key={`qna-${index}`}
                    className="grid grid-cols-[44px_1fr] gap-3 rounded-sm border border-border p-3"
                  >
                    <div className="flex flex-col items-center justify-start">
                      <button
                        type="button"
                        onClick={() =>
                          setVotes((current) =>
                            current.map((vote, voteIndex) =>
                              voteIndex === index ? vote + 1 : vote,
                            ),
                          )
                        }
                        aria-label="Upvote"
                        className="text-muted-foreground"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {votes[index] ?? 0}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setVotes((current) =>
                            current.map((vote, voteIndex) =>
                              voteIndex === index ? vote - 1 : vote,
                            ),
                          )
                        }
                        aria-label="Downvote"
                        className="text-muted-foreground"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Badge variant="outline">Q</Badge>
                        <p className="text-sm">{item.question}</p>
                        <p className="text-xs text-muted-foreground">
                          Asked by {item.askedBy} on {item.date}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Badge variant="outline">A</Badge>
                        <p
                          className={`text-sm text-muted-foreground ${isExpanded ? "" : "line-clamp-2"}`}
                        >
                          {item.answer}
                        </p>
                        <button
                          type="button"
                          className="text-xs text-muted-foreground underline"
                          onClick={() =>
                            setExpandedAnswers((current) => ({
                              ...current,
                              [index]: !isExpanded,
                            }))
                          }
                        >
                          {isExpanded ? "Read less" : "Read more"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No questions yet.</p>
            )}
            <p className="text-sm text-muted-foreground">
              Only registered users can submit questions.
            </p>
          </div>
        ) : null}

        {activeTab === "other-info" ? (
          <div>
            {otherInfo ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Country of Origin:</span>{" "}
                  <span className="text-muted-foreground">
                    {otherInfo.origin || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Import By:</span>{" "}
                  <span className="text-muted-foreground">
                    {otherInfo.importBy || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  <span className="text-muted-foreground">
                    {otherInfo.address || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Customer Care:</span>{" "}
                  {otherInfo.customerCare?.phone ? (
                    <a
                      className="text-muted-foreground underline"
                      href={`tel:${otherInfo.customerCare.phone}`}
                    >
                      {otherInfo.customerCare.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                  {" | "}
                  {otherInfo.customerCare?.email ? (
                    <a
                      className="text-muted-foreground underline"
                      href={`mailto:${otherInfo.customerCare.email}`}
                    >
                      {otherInfo.customerCare.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No additional information available.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
