/* ----------------------------------------------------------------------------
   ContentContext — makes the WHOLE website dynamic.

   · On load it fetches all content from the API (MySQL via server/).
   · If the API is unreachable it falls back to the bundled static data in
     content.ts, so the site always renders (offline / no-backend mode).
   · Pages consume content with:  const { services, team, ... } = useContent();
   · Admin CRUD helpers update the API then refresh every page live.
------------------------------------------------------------------------------ */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  services as fallbackServices,
  projects as fallbackProjects,
  techCategories as fallbackTechCategories,
  team as fallbackTeam,
  testimonials as fallbackTestimonials,
  blogPosts as fallbackBlogPosts,
  jobs as fallbackJobs,
  processSteps as fallbackProcessSteps,
  whyChooseUs as fallbackWhyChooseUs,
  navLinks as fallbackNavLinks,
  type Service,
  type Project,
  type TeamMember,
  type Testimonial,
  type BlogPost,
  type Job,
  type TechItem,
} from "./content";
import { fetchContent, api, setToken, getToken } from "./api";

export type TechCategory = { title: string; icon: string; items: TechItem[]; blurb: string };
export type ProcessStep = { n: string; title: string; icon: string; text: string };
export type WhyChooseUsItem = { icon: string; title: string; text: string };
export type NavLink = { label: string; path: string };
export type AdminMessage = {
  id: number; name: string; email: string; phone?: string; company?: string;
  service?: string; budget?: string; message?: string; date: string; status: string;
};
export type AdminQuote = {
  id: number; name: string; email: string; phone?: string; company?: string;
  projectType?: string; service?: string; budget?: string; deadline?: string;
  details?: string; date: string; status: string;
};

type Content = {
  services: Service[];
  projects: Project[];
  techCategories: TechCategory[];
  team: TeamMember[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  jobs: Job[];
  processSteps: ProcessStep[];
  whyChooseUs: WhyChooseUsItem[];
  navLinks: NavLink[];
};

const staticContent: Content = {
  services: fallbackServices,
  projects: fallbackProjects,
  techCategories: fallbackTechCategories,
  team: fallbackTeam,
  testimonials: fallbackTestimonials,
  blogPosts: fallbackBlogPosts,
  jobs: fallbackJobs,
  processSteps: fallbackProcessSteps,
  whyChooseUs: fallbackWhyChooseUs,
  navLinks: fallbackNavLinks,
};

type Ctx = Content & {
  loading: boolean;
  isDynamic: boolean; // true when data comes from the API/database
  refresh: () => Promise<void>;
  createItem: (entity: string, item: Record<string, unknown>) => Promise<unknown>;
  updateItem: (entity: string, id: string | number, item: Record<string, unknown>) => Promise<unknown>;
  deleteItem: (entity: string, id: string | number) => Promise<unknown>;
};

const ContentContext = createContext<Ctx>({
  ...staticContent,
  loading: false,
  isDynamic: false,
  refresh: async () => {},
  createItem: async () => {},
  updateItem: async () => {},
  deleteItem: async () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Content>(staticContent);
  const [loading, setLoading] = useState(true);
  const [isDynamic, setIsDynamic] = useState(false);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const remote = (await fetchContent()) as Partial<Content>;
      if (!alive.current) return;
      setData((prev) => ({
        services: remote.services?.length ? remote.services : prev.services,
        projects: remote.projects?.length ? remote.projects : prev.projects,
        techCategories: remote.techCategories?.length ? remote.techCategories : prev.techCategories,
        team: remote.team?.length ? remote.team : prev.team,
        testimonials: remote.testimonials?.length ? remote.testimonials : prev.testimonials,
        blogPosts: remote.blogPosts?.length ? remote.blogPosts : prev.blogPosts,
        jobs: remote.jobs?.length ? remote.jobs : prev.jobs,
        processSteps: remote.processSteps?.length ? remote.processSteps : prev.processSteps,
        whyChooseUs: remote.whyChooseUs?.length ? remote.whyChooseUs : prev.whyChooseUs,
        navLinks: remote.navLinks?.length ? remote.navLinks : prev.navLinks,
      }));
      setIsDynamic(true);
    } catch {
      if (alive.current) setIsDynamic(false); // keep bundled content
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    refresh();
    return () => {
      alive.current = false;
    };
  }, [refresh]);

  const mutate = useCallback(
    async (fn: () => Promise<unknown>) => {
      const out = await fn();
      await refresh();
      return out;
    },
    [refresh]
  );

  const value = useMemo<Ctx>(
    () => ({
      ...data,
      loading,
      isDynamic,
      refresh,
      createItem: (entity, item) => mutate(() => api.create(entity, item)),
      updateItem: (entity, id, item) => mutate(() => api.update(entity, id, item)),
      deleteItem: (entity, id) => mutate(() => api.remove(entity, id)),
    }),
    [data, loading, isDynamic, refresh, mutate]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}

/* Re-exports so Admin (and anything else) can manage the session easily */
export { setToken, getToken };
