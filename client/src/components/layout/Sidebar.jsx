import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Link2, 
  Upload,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', to: '', icon: LayoutDashboard },      // index route = /admin
  { name: 'Students', to: 'students', icon: GraduationCap }, // /admin/students
  { name: 'Faculty', to: 'faculty', icon: Users },           // /admin/faculty
  { name: 'Mappings', to: 'mappings', icon: Link2 },         // /admin/mappings
  { name: 'CSV Import', to: 'import', icon: Upload },        // /admin/import
];


export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">Admin Panel</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="px-4 py-3 bg-muted rounded-lg">
              <p className="text-xs font-medium text-foreground">Admin Management</p>
              <p className="text-xs text-muted-foreground mt-1">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
