import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Podemos carregar o perfil do usuário se necessário
      // Mas por enquanto vamos salvar os dados do login localmente
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    const {
      token: jwt,
      id,
      username: uname,
      email,
      fullName,
      roles,
    } = response.data;
    localStorage.setItem("token", jwt);
    localStorage.setItem(
      "user",
      JSON.stringify({ id, username: uname, email, fullName, roles }),
    );
    setToken(jwt);
    setUser({ id, username: uname, email, fullName, roles });
    api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }) => {
    await api.post("/auth/register", data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
