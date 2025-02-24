import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loja: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loja: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loja, setLoja] = useState<string | null>(null);
  const router = useRouter();

  // Mapeamento correto dos logins para os IDs das lojas
  const LOJA_MAP = {
    'afonsopena': 'afonso_pena',      // tabelas: vendedores_afonso_pena, historico_afonso_pena, etc
    'juliodecastilho': 'julio',       // tabelas: vendedores_julio, historico_julio, etc
    'prime': 'prime',                 // tabelas: vendedores_prime, historico_prime, etc
    'nortesul': 'norte_sul',          // tabelas: vendedores_norte_sul, historico_norte_sul, etc
    'maracaju': 'maracaju'           // tabelas: vendedores_maracaju, historico_maracaju, etc
  } as const;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        
        // Pegar o login do email (parte antes do @)
        const loginName = session.user.email?.split('@')[0] || '';
        console.log('Login detectado:', loginName);
        
        // Mapear para o ID correto da loja
        const userLoja = LOJA_MAP[loginName as keyof typeof LOJA_MAP];
        console.log('Loja mapeada:', userLoja);

        if (userLoja) {
          setLoja(userLoja);
          // Verificar acesso às tabelas da loja
          verifyLojaTables(userLoja);
        } else {
          console.error('Loja não encontrada para o login:', loginName);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        const loginName = session.user.email?.split('@')[0] || '';
        const userLoja = LOJA_MAP[loginName as keyof typeof LOJA_MAP];
        if (userLoja) {
          setLoja(userLoja);
        }
      } else {
        setUser(null);
        setLoja(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Verificar acesso às tabelas específicas da loja
  const verifyLojaTables = async (lojaId: string) => {
    try {
      const tables = [
        `vendedores_${lojaId}`,
        `historico_${lojaId}`,
        `orcamentos_${lojaId}`,
        `estatisticas_${lojaId}`
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          console.error(`Erro ao acessar tabela ${table}:`, error);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Verificar se é um login válido
      if (!LOJA_MAP[email as keyof typeof LOJA_MAP]) {
        throw new Error('Login não autorizado');
      }

      const loginEmail = `${email}@diniz.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });

      if (error) throw error;
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loja, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 