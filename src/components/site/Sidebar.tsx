import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Film, Tv, Bookmark, Heart, History, Settings, CircleHelp, Info, Tags, Clapperboard, Globe } from "lucide-react";
import { Brand } from "@/components/site/Brand";
const genres=[{id:28,name:"Action"},{id:35,name:"Comedy"},{id:18,name:"Drama"},{id:27,name:"Horror"},{id:878,name:"Sci-Fi"},{id:53,name:"Thriller"},{id:16,name:"Animation"},{id:10749,name:"Romance"}];
export function Sidebar(){
 const path=useRouterState({select:s=>s.location.pathname});
 const cls=(active:boolean)=>`sidebar-link ${active?"sidebar-link-active":""}`;
 return <aside className="site-sidebar" aria-label="Main navigation">
  <div className="sidebar-brand"><Brand tagline/></div>
  <nav className="space-y-1">
   <Link to="/home" className={cls(path==="/home")}><Home/>Home</Link>
   <Link to="/genre/$id" params={{id:"28"}} search={{type:"movie"}} className={cls(path.startsWith("/genre/"))}><Film/>Movies</Link>
   <Link to="/genre/$id" params={{id:"10759"}} search={{type:"tv"}} className={cls(false)}><Tv/>TV Shows</Link>
   <Link to="/home" className={cls(false)}><Clapperboard/>Shorts <span className="sidebar-new">NEW</span></Link>
  </nav>
  <div className="sidebar-divider"/>
  <nav className="space-y-1">
   <Link to="/watchlist" className={cls(path==="/watchlist")}><Bookmark/>My List</Link>
   <Link to="/watchlist" className={cls(false)}><Heart/>Favorites</Link>
   <Link to="/watchlist" className={cls(false)}><History/>History</Link>
  </nav>
  <div className="sidebar-divider"/>
  <div className="sidebar-section-label"><Tags/>Categories</div>
  <Link to="/genre/$id" params={{id:"28"}} search={{type:"movie"}} className="sidebar-all-categories">All Categories <span>⌄</span></Link>
  <nav className="sidebar-genre-list">{genres.map(g=><Link key={g.id} to="/genre/$id" params={{id:String(g.id)}} search={{type:"movie"}} className={cls(path===`/genre/${g.id}`)}>{g.name}</Link>)}</nav>
  <div className="sidebar-divider"/>
  <nav className="mt-auto space-y-1">
   <Link to="/settings" className={cls(path==="/settings")}><Settings/>Settings</Link>
   <Link to="/help" className={cls(path==="/help")}><CircleHelp/>Help Desk</Link>
   <Link to="/about" className={cls(path==="/about")}><Info/>About BIG MOV</Link>
  </nav>
  <div className="sidebar-language"><Globe/>Language <span>English⌄</span></div>
 </aside>;
}
