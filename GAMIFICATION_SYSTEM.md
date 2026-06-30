# Gamification System: Recompensa Intermitente (Intermittent Rewards)

## Concepto Fundamental

**Recompensa Intermitente** (Variable Ratio Schedule) - El usuario recibe premios después de un número **IMPREDECIBLE** de acciones, no después de cada acción. Esto crea un efecto psicológico poderoso similar al de las máquinas tragaperras: la incertidumbre aumenta el compromiso.

### Por qué funciona:
- **Impredecibilidad**: Los usuarios siguen intentando porque no saben cuándo llegarán premios
- **Anticipación**: La dopamina se libera por la EXPECTATIVA, no solo por la recompensa
- **Creación de hábitos**: Genera el comportamiento más resistente vs recompensa continua
- **Engagement prolongado**: Los usuarios permanecen más tiempo en la app

---

## Arquitectura del Sistema para clar1ty

### 1. PUNTOS (Points System)

**Tipos de puntos:**

```
- Clarity Points: Puntos por cada upscale
- Streak Bonus: Bonificación por consistencia diaria
- Achievement Badges: Logros especiales
- Community Rewards: Puntos por compartir/referir
```

**Ganancia de puntos:**
- Upscale 2x: 10 points (base)
- Upscale 3x: 25 points
- Upscale 4x: 50 points
- Compra de créditos: 100 bonus points
- Referral exitoso: 500 points

### 2. RECOMPENSA INTERMITENTE (Variable Ratio)

**Sistema de Triggers Aleatorios:**

```
VR(5): Recompensa cada 5 acciones EN PROMEDIO (rango: 1-9)
VR(10): Recompensa cada 10 acciones EN PROMEDIO (rango: 3-17)
VR(20): Recompensa cada 20 acciones EN PROMEDIO (rango: 5-35)
```

**Tipo de premios aleatorios:**

```json
{
  "bonus_credits": 10,           // +10 créditos gratis
  "double_points": true,          // Dobla puntos en próxima acción
  "streak_reset": false,          // No pierde racha
  "unlock_preset": "pro_edition", // Acceso temporal a feature
  "mystery_reward": "surprise"    // Premio misterioso (tensión)
}
```

### 3. STREAKS Y CONSECUTIVOS

**Daily Streak:**
- Día 1-3: x1 multiplicador
- Día 4-7: x1.5 multiplicador
- Día 8-14: x2 multiplicador
- Día 15+: x3 multiplicador + Daily Bonus

**Freeze Days:**
- Usuario puede "congelar" racha 1x por semana = No pierde racha

### 4. LEADERBOARDS Y COMPETICIÓN

**Tipos:**

```
1. Weekly Leaderboard: Top 10 usuarios (reset cada lunes)
2. Monthly Leaderboard: Top 50 usuarios (reset cada mes)
3. Global Lifetime: Top 100 all-time
4. Country Leaderboard: Rankings por país
```

**Premios por ranking:**
- #1-3: Badges + Extra credits
- #4-10: Special badge
- #11-50: Participation trophy

### 5. ACHIEVEMENT SYSTEM

**Logros desbloqueables:**

```
Tier 1 (Easy - Desbloqueados rápido):
- "First Upscale" (1x upscale)
- "5 in a Day" (5 upscales en 1 día)
- "Week Warrior" (7 días consecutivos)

Tier 2 (Medium):
- "Upscale Master" (50 upscales)
- "Credit Collector" (500 puntos)
- "Perfect Month" (30 días consecutivos)

Tier 3 (Hard):
- "Legend Status" (1000 upscales)
- "Platinum Member" (10,000 puntos)
- "Community Hero" (10 referrals exitosos)
```

### 6. MYSTERY REWARDS (Tensión & Sorpresa)

**Cuándo aparecen:**
- Random VR(15) trigger
- Mostrar: "🎁 MYSTERY REWARD!" con animación

**Tipos:**
- ✨ 50 puntos bonus
- ⭐ Unlock premium filter
- 🎪 Double points for 1 hour
- 🏆 Instant +1 rank

---

## Implementación Técnica

### Base de Datos

```sql
-- Tabla de Logros
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_type VARCHAR(50),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  points_awarded INT
);

-- Tabla de Streaks
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  last_action_date DATE,
  frozen_until DATE,
  freeze_used_this_week BOOLEAN DEFAULT FALSE
);

-- Tabla de Recompensas Aleatorias
CREATE TABLE random_rewards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  reward_type VARCHAR(50),
  points_awarded INT,
  credits_awarded INT,
  unlocked_feature VARCHAR(100),
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Leaderboards
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  points INT,
  week_number INT,
  month INT,
  year INT,
  rank INT,
  country VARCHAR(50)
);
```

### API Endpoints

```
POST   /api/gamification/check-reward    → Verifica si usuario gana recompensa
POST   /api/gamification/claim-reward    → Reclama recompensa
GET    /api/gamification/streak          → Obtiene streak actual
PUT    /api/gamification/freeze-streak   → Congela racha
GET    /api/gamification/leaderboard     → Obtiene leaderboard
GET    /api/gamification/achievements    → Lista logros del usuario
POST   /api/gamification/unlock-achievement → Desbloquea logro
```

### Lógica de Variable Ratio

```typescript
// Función para calcular si usuario gana recompensa
function shouldAwardReward(userActionCount: number, vrRatio: number): boolean {
  // VR(5) = recompensa cada 5 en promedio
  // Rango: VR/2 a VR*2 (5/2=2.5, 5*2=10)
  const min = Math.ceil(vrRatio / 2);
  const max = Math.ceil(vrRatio * 2);
  const randomThreshold = Math.random() * (max - min) + min;
  
  return (userActionCount % randomThreshold) === 0;
}

// Seleccionar reward aleatorio
function selectRandomReward(): Reward {
  const rewards = [
    { type: "bonus_credits", chance: 0.4 },     // 40%
    { type: "double_points", chance: 0.3 },     // 30%
    { type: "mystery", chance: 0.2 },           // 20%
    { type: "unlock_feature", chance: 0.1 }     // 10%
  ];
  
  const rand = Math.random();
  let cumulative = 0;
  
  for (const reward of rewards) {
    cumulative += reward.chance;
    if (rand <= cumulative) return reward;
  }
}
```

---

## UI/UX Patterns

### 1. Reward Popup Animation

```
Cuando usuario gana recompensa:
1. Toast elegante sube desde abajo
2. Confetti animation (opcional)
3. Sonido de "ding" (optional audio)
4. Muestra: "🎁 +50 PUNTOS!" con efecto glow
5. Desaparece en 3 segundos
```

### 2. Streak Display

```
Ubicación: Top-right navbar
Mostrar: "🔥 7 días" con contador visual
Color: Degradado naranja/rojo
Botón: "❄️ Freeze" disponible 1x/semana
```

### 3. Leaderboard Card

```
Mostrar:
- Tu posición actual (#42)
- Puntos totales
- Distancia al siguiente tier
- Progreso bar hacia próximo nivel
```

### 4. Achievement Unlock Animation

```
Cuando desbloquea logro:
1. Pantalla oscurece ligeramente
2. Badge aparece en centro con zoom
3. Sonido épico de unlock
4. Muestra descripción
5. Botón: "Compartir" → Social media
```

---

## Estrategia de Engagement

### Fase 1: Onboarding Gamificado (Primeros 7 días)

- Recompensas MÁS frecuentes (VR(3))
- Todos los logros fáciles están disponibles
- Daily streak comienza automáticamente
- Notificación: "¡Haz 3 upscales para ganar recompensa!"

### Fase 2: Hábito Formado (Semana 2-4)

- Recompensas normalizado (VR(8))
- Introducer streaks más difíciles
- Mostrar leaderboard

### Fase 3: Engagement Sostenido (Mes 2+)

- VR(15) - menos frecuente, más valioso
- Competencia mensual
- Desafíos especiales semanales

---

## Métricas de Éxito

```
1. Daily Active Users (DAU) - Meta: +40%
2. Session Duration - Meta: +2.5x
3. Repeat Users Day 7 - Meta: 70%
4. Repeat Users Day 30 - Meta: 50%
5. User Points Claimed - Meta: >80% reclaman rewards
6. Leaderboard Participation - Meta: >60% participan
```

---

## Implementación por Fases

**Week 1:** Crear tablas DB + APIs básicas
**Week 2:** UI para streaks + achievements
**Week 3:** Leaderboards + random rewards
**Week 4:** Notifications + social sharing
