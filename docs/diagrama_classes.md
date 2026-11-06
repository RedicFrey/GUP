# Diagrama de classes do domínio

Classes de `backend/models/` e as ligações entre elas. Cada Model corresponde a uma tabela de `backend/database/schema.sql`.

- **Herança** (`<|--`): todas as Models herdam de `BaseModel`, que tem o CRUD (`salvar`, `atualizar`, `deletar`, `listar_todos`, `buscar_por_id`). `ChildProfile` e `ResponsibleProfile` herdam de `ProfileModel` e ficam na mesma tabela (`profiles`), separados por `profile_type`. Os três itens da girafa herdam de `GiraffeItemModel`.
- **Composição** (`*--`): a parte não existe sem o todo. Apagar a conta família apaga os perfis, as tarefas, as recompensas e os eventos dela. Apagar uma criança apaga a girafa, o histórico de moedas e os resgates dela (`ON DELETE CASCADE`).
- **Agregação** (`o--`): o item existe sozinho e só é usado pelo todo. Por exemplo, a girafa usa uma cor, um fundo e um acessório do catálogo, mas os itens continuam existindo sem ela.
- **Associação** (`-->`): é só uma referência (`ON DELETE SET NULL`), como o nível da criança, a meta, a recompensa de um resgate e quem criou cada registro.

```mermaid
classDiagram
    direction TB

    class BaseModel {
        <<abstract>>
        +TABLE
        +COLUMNS
        +FAMILY_COLUMN
        +salvar()
        +atualizar(campos)
        +deletar()
        +listar_todos()$
        +buscar_por_id(id)$
        +buscar_por_id_e_familia(id, family_account_id)$
        +listar_por_familia(family_account_id)$
    }

    class FamilyAccountModel {
        +int id
        +str name
        +str email
        +str password_hash
        +date birth_date
    }

    class ProfileModel {
        <<abstract>>
        +int id
        +int family_account_id
        +str name
        +str profile_type
        +str role
        +str notification_email
        +str pin_hash
        +int created_by
        +has_pin() bool
        +is_admin() bool
    }

    class ResponsibleProfile {
        +PROFILE_TYPE = "responsible"
    }

    class ChildProfile {
        +PROFILE_TYPE = "child"
        +int coins
        +int xp
        +int level_id
        +int seen_level
        +int goal_id
        +int strikes
        +add_coins(amount) int
        +remove_coins(amount) int
        +add_xp(amount) int
    }

    class LevelModel {
        +int id
        +int level
        +int xp_required
    }

    class TaskModel {
        +int id
        +str name
        +str description
        +datetime deadline
        +int coins_reward
        +int xp_reward
        +bool required_proof
        +int created_by
        +int family_account_id
    }

    class TaskAssignmentModel {
        +int id
        +int task_id
        +int child_profile_id
        +str status
        +datetime submitted_at
        +datetime completion_date
        +str proof_photo
        +int coins_earned
        +int xp_earned
    }

    class CoinHistoryModel {
        +int id
        +str name
        +str source
        +str amount_type
        +int amount
        +int child_profile_id
        +fit_name(name) str$
        +validate()
    }

    class RewardModel {
        +int id
        +str name
        +int amount
        +int family_account_id
    }

    class RedemptionModel {
        +int id
        +str name
        +str status
        +int amount
        +int child_profile_id
        +int reward_id
    }

    class EventModel {
        +int id
        +str name
        +date event_date
        +int family_account_id
        +int created_by
    }

    class GiraffeModel {
        +int id
        +int child_profile_id
        +int color_id
        +int background_id
        +int accessory_id
    }

    class GiraffeItemModel {
        <<abstract>>
        +int id
        +str name
        +str image_url
        +int required_level
        +is_unlocked_for(level) bool
    }

    class GiraffeColorModel
    class GiraffeBackgroundModel
    class GiraffeAccessoryModel

    class NotificationPreferenceModel {
        +int id
        +int profile_id
        +str type
        +bool enabled
    }

    %% herança
    BaseModel <|-- FamilyAccountModel
    BaseModel <|-- ProfileModel
    BaseModel <|-- LevelModel
    BaseModel <|-- TaskModel
    BaseModel <|-- TaskAssignmentModel
    BaseModel <|-- CoinHistoryModel
    BaseModel <|-- RewardModel
    BaseModel <|-- RedemptionModel
    BaseModel <|-- EventModel
    BaseModel <|-- GiraffeModel
    BaseModel <|-- GiraffeItemModel
    BaseModel <|-- NotificationPreferenceModel
    ProfileModel <|-- ResponsibleProfile
    ProfileModel <|-- ChildProfile
    GiraffeItemModel <|-- GiraffeColorModel
    GiraffeItemModel <|-- GiraffeBackgroundModel
    GiraffeItemModel <|-- GiraffeAccessoryModel

    %% composição (ON DELETE CASCADE)
    FamilyAccountModel "1" *-- "1..*" ProfileModel : perfis
    FamilyAccountModel "1" *-- "*" TaskModel : tarefas
    FamilyAccountModel "1" *-- "*" RewardModel : recompensas
    FamilyAccountModel "1" *-- "*" EventModel : eventos
    TaskModel "1" *-- "1..*" TaskAssignmentModel : atribuída a
    ChildProfile "1" *-- "*" TaskAssignmentModel : recebe
    ChildProfile "1" *-- "1" GiraffeModel : girafa
    ChildProfile "1" *-- "*" CoinHistoryModel : histórico
    ChildProfile "1" *-- "*" RedemptionModel : resgates
    ResponsibleProfile "1" *-- "*" NotificationPreferenceModel : avisos

    %% agregação (itens do catálogo usados pela girafa)
    GiraffeModel "*" o-- "1" GiraffeColorModel : cor
    GiraffeModel "*" o-- "1" GiraffeBackgroundModel : fundo
    GiraffeModel "*" o-- "0..1" GiraffeAccessoryModel : acessório

    %% associação (ON DELETE SET NULL)
    ChildProfile "*" --> "0..1" LevelModel : nível
    ChildProfile "*" --> "0..1" RewardModel : meta
    RedemptionModel "*" --> "0..1" RewardModel : recompensa
    TaskModel "*" --> "0..1" ResponsibleProfile : created_by
    EventModel "*" --> "0..1" ProfileModel : created_by
    ProfileModel "*" --> "0..1" ProfileModel : created_by
```

## Camadas que usam as Models

As Models só fazem o CRUD da própria tabela. As outras camadas do backend usam as Models assim:

| Camada | Pasta | Papel |
|---|---|---|
| Controller | `backend/controllers/` | Uma classe por recurso (herda de `BaseController`). Lê a requisição, chama o Service e responde. |
| Service | `backend/services/<domínio>/` | Uma classe por ação, com o método `execute`. Valida e coordena usando Models e Repositories. |
| Repository | `backend/repositories/` | Só consultas especiais: joins, filtros, paginação, relatório e `SELECT ... FOR UPDATE`. |
| Integração externa | `backend/services/email/send_email_service.py` | `SendEmailService` é o único que fala com o SMTP do Gmail. |
