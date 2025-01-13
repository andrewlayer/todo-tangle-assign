import { useNavigate, useLocation } from 'react-router-dom';
import { ClipboardList, Settings, Timer, Archive } from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-accent" : "";
  };

  return (
    <div className="border-b mb-4">
      <div className="container mx-auto">
        <Menubar className="border-none">
          <MenubarMenu>
            <MenubarTrigger 
              className={isActive('/status')} 
              onClick={() => navigate('/status')}
            >
              <Timer className="w-4 h-4 mr-2" />
              Where I Left Off
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger 
              className={isActive('/todos')} 
              onClick={() => navigate('/todos')}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Todos
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger 
              className={isActive('/backlogs')} 
              onClick={() => navigate('/backlogs')}
            >
              <Archive className="w-4 h-4 mr-2" />
              Backlogs
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger 
              className={isActive('/settings')} 
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
};

export default TopNav;