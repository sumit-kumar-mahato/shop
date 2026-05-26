import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import { prisma } from "@/lib/db";

// Helper to safely parse JSON strings
function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

export default async function BlogPage() {
  let blogs: any[] = [];
  try {
    blogs = await prisma.blog.findMany({
      orderBy: { publishDate: "desc" },
    });
  } catch (e) {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center space-y-3 mb-12">
        <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">PRABODH KUMAR MAHATO JOURNALS</span>
        <h1 className="serif-header text-3xl sm:text-4xl font-normal uppercase tracking-wide">Fashion & Styling Journals</h1>
        <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-2" />
        <p className="text-xs text-luxury-500 font-light max-w-sm mx-auto leading-relaxed pt-1">
          Explore summer style templates, historical drape traditions, garment care rules, and wardrobe recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {blogs.map((blog) => {
          const tags = safeParse(blog.tags);
          const publishDateStr = new Date(blog.publishDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={blog.id}
              className="group flex flex-col space-y-4 bg-white dark:bg-zinc-900 border border-luxury-200/20 dark:border-zinc-800/40 p-4 rounded-sm shadow-sm hover:shadow-md transition-all"
            >
              {/* Blog cover */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-200">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                />
              </div>

              {/* Tag bubbles */}
              <div className="flex gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[9px] bg-luxury-100 dark:bg-zinc-800 text-luxury-600 dark:text-zinc-400 px-2 py-0.5 rounded font-bold uppercase"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Title & Description preview */}
              <div className="flex-grow space-y-2">
                <h3 className="serif-header text-lg uppercase tracking-wide text-zinc-900 dark:text-white group-hover:text-luxury-gold transition-colors font-semibold">
                  {blog.title}
                </h3>
                <p className="text-xs text-luxury-500 font-light leading-relaxed line-clamp-3">
                  {blog.content}
                </p>
              </div>

              {/* Metadata footer */}
              <div className="pt-4 border-t border-luxury-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-luxury-400 font-light">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User size={11} className="text-luxury-gold" /> {blog.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} className="text-luxury-gold" /> {publishDateStr}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-luxury-gold" /> {blog.readTime}
                  </span>
                </div>
                <Link
                  href={`/blog`}
                  className="text-xs font-bold tracking-widest text-zinc-900 dark:text-white hover:text-luxury-gold flex items-center gap-1"
                >
                  READ <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
