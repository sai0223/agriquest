-- ============================================================
-- AgriQuest V1 - Full Database Schema
-- PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('STUDENT', 'FARMER', 'TEACHER')),
    xp              INT          NOT NULL DEFAULT 0,
    green_points    INT          NOT NULL DEFAULT 0,
    level           INT          NOT NULL DEFAULT 1,
    streak_days     INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_simulations (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop                 VARCHAR(100) NOT NULL,
    current_stage        VARCHAR(50)  NOT NULL DEFAULT 'SOIL_PREPARATION',
    health_score         INT          NOT NULL DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
    sustainability_score INT          NOT NULL DEFAULT 100 CHECK (sustainability_score BETWEEN 0 AND 100),
    status               VARCHAR(20)  NOT NULL DEFAULT 'IN_PROGRESS'
                             CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_decisions (
    id                   BIGSERIAL PRIMARY KEY,
    simulation_id        BIGINT       NOT NULL REFERENCES farm_simulations(id) ON DELETE CASCADE,
    stage                VARCHAR(50)  NOT NULL,
    choice_key           VARCHAR(100) NOT NULL,
    choice_value         VARCHAR(255) NOT NULL,
    feedback             TEXT,
    health_impact        INT          NOT NULL DEFAULT 0,
    sustainability_impact INT         NOT NULL DEFAULT 0,
    decided_at           TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_topics (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    video_url   VARCHAR(500),
    notes       TEXT,
    category    VARCHAR(50)  NOT NULL,
    difficulty  VARCHAR(20)  NOT NULL CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    image_url   VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS quizzes (
    id       BIGSERIAL PRIMARY KEY,
    topic_id BIGINT       NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
    title    VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id             BIGSERIAL PRIMARY KEY,
    quiz_id        BIGINT  NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text  TEXT    NOT NULL,
    options        JSONB   NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    explanation    TEXT
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id      BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score        INT    NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    answers      JSONB,
    completed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    icon_url        VARCHAR(500),
    criteria_type   VARCHAR(50)  NOT NULL,
    criteria_value  INT          NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badges (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id  BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS community_posts (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(500) NOT NULL,
    question_text TEXT         NOT NULL,
    category      VARCHAR(50),
    views         INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_answers (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT  NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id     BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answer_text TEXT    NOT NULL,
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    upvotes     INT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_diary_entries (
    id         BIGSERIAL PRIMARY KEY,
    farmer_id  BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop       VARCHAR(100) NOT NULL,
    day_stage  VARCHAR(255) NOT NULL,
    photo_url  VARCHAR(500),
    notes      TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_logs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_context VARCHAR(20)  NOT NULL,
    query        TEXT         NOT NULL,
    response     TEXT         NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);