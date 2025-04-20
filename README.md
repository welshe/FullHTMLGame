Updates : 

Fixed the 10 placeholder abilitys and now they are functioning

Core Gameplay:

    Top-Down View: The game is rendered from a top-down perspective on an HTML canvas.
    Wave Defense: Enemies spawn in waves, with each wave increasing in difficulty (more enemies).
    Auto-Aim Shooting: The player character automatically targets and shoots at the closest enemy.
    Click to Start: The game starts or restarts by clicking on the start/game over screen.
    Visible Map: The game area (the canvas) is visible, with a simple background grid.

Player Features:

    Player Character: A controllable character represented by a blue circle.
    Movement: Player can move using WASD or the arrow keys.
    Health: Player has health and can take damage from enemies and enemy projectiles.
    Dash Ability: Player can press SPACE to perform a quick dash, granting temporary invincibility (with a cooldown).
    Coin Collection: Player collects coins dropped by defeated enemies.

Enemy Features:

    Multiple Enemy Types: Conceptual definition for 15 different enemy types with varying stats (speed, health, damage, coin drop).
    Basic Enemy AI: Enemies generally move towards the player.
    Specific Enemy Behaviors:
        Shooter enemies stop and fire projectiles at the player.
        Splitter enemies split into two smaller enemies when defeated.
        Regenerator enemies passively heal over time (if the healing wave feature is active).
        (Other enemy types are defined but have basic movement unless their unique behavior was part of the implemented wave features).
    Damage Dealing: Enemies deal damage to the player on contact.
    Coin Drops: Enemies drop coins upon defeat.
    Powerup Drops: Enemies have a chance to drop random powerups upon defeat.
    Visual Hit Flash: Enemies briefly flash white when hit by player projectiles.
    Health Bars: Enemies display health bars above them.

Projectiles:

    Player Projectiles: White circles fired from the player towards the auto-aimed enemy.
    Enemy Projectiles: Projectiles fired by Shooter/Spitter type enemies towards the player.
    Collision Detection: Projectiles collide with their targets (player projectiles with enemies, enemy projectiles with the player).
    Off-screen Removal: Projectiles are removed when they go outside the canvas boundaries.

Wave System:

    Wave Progression: The game progresses through increasing wave numbers after all enemies are defeated.
    Random Enemy Amounts: Each wave spawns a random amount of enemies (scaling with wave number).
    Initial Wave Speed Adjustment: Enemies in the first few waves are intentionally slowed down.
    End-of-Wave Shop: A shop opens at the end of each wave.

Shop and Upgrades:

    Purchasable Items: Player can spend collected coins in the shop.
    25 Distinct Items: The shop offers a total of 25 different items:
        15 Main Upgrades: These primarily boost player stats or unlock abilities (Speed, Fire Rate, Damage, Max Health, Heal, Coin Bonus on Purchase, Projectile Speed, Area Damage Unlock, Fire Rate Cap, Life Steal (Placeholder), Critical Chance (Placeholder), Extra Life (Placeholder), Coin Value Increase, Powerup Duration (Placeholder), Reduce Next Wave Health (Placeholder)). Note: Some effects are fully implemented, others are placeholders requiring more logic.
        10 Passive Items: These provide continuous benefits throughout the game (Passive Health Regen (Implemented), Passive Coin Gain (Implemented), Enemy Speed Aura (Implemented - simple slowing effect), Experience Bonus (Placeholder), Damage Resistance (Implemented - reduces damage taken), Powerup Spawn Chance (Placeholder), Faster Dash Cooldown (Implemented - reduces dash cooldown), Projectile AOE (Placeholder), Critical Damage (Placeholder), Coin Magnet Range (Implemented - increases magnet radius)). Note: Some effects are fully implemented, others are placeholders.
    Item Costs and Descriptions: Each item has a coin cost and a descriptive text (displayed as a tooltip).
    Categorized Shop Display: Items are separated into "Upgrades" and "Passive Items" in the shop UI.

Powerups:

    Random Drops: Enemies randomly drop powerups on defeat.
    Temporary Effects: Powerups grant temporary boosts (Speed Boost, Fire Rate Boost, Damage Boost, Invincibility, Coin Magnet).
    Unique Powerup Effects:
        Area Damage: Deals instant damage to all enemies on screen when collected.
        Slow Field: Creates an area around the player that slows down enemies within it.
    Duration: Powerup effects last for a fixed duration (default 10 seconds, except Area Damage).
    Active Powerup Display: Shows the names and remaining durations of active powerups on the UI.

Unique Features:

    Start Page:
        Displays a random gameplay tip each time the game starts.
        Shows the player's highest score (persistent).
        Has a simple animated background effect (flickering dots).
    Wave Features: At the start of waves after the first, a random unique wave feature can be applied, modifying gameplay (e.g., faster enemies, more tanky enemies, reduced player speed, enemies having a chance to dodge). Note: The implementation of these effects varies in completeness.

Achievements:

    12 Defined Achievements: A list of achievements with descriptions (though the tracking and unlocking logic is implemented for some based on basic game events like kills, wave reached, coins collected, upgrades purchased, powerups collected, dash used, area damage used).
    Unlock Notification: A temporary notification pops up when an achievement is unlocked.

Visual and Audio (Basic):

    Canvas Rendering: The game is drawn on an HTML <canvas>.
    Simple Shapes: Uses circles and rectangles to represent game objects.
    Background Grid: A subtle grid is drawn on the background.
    Improved Health Bars: Health bars are colored based on health percentage (green, yellow, red) and have a background and border.
    Spark Particles: Simple particles are created and animated when projectiles hit enemies or the player.
    Limited Visibility Overlay: A visual effect for the "Limited visibility" wave feature that darkens the screen except for an area around the player.
    Player Dash Visual: A larger, semi-transparent circle is drawn around the player while dashing.
    Sound Effect Structure (Placeholder): Includes the JavaScript structure using the Web Audio API to load and play sounds, but requires actual sound files and uncommenting the play calls to be functional.

Technical:

    Game Loop: Uses requestAnimationFrame for a smooth game loop.
    Input Handling: Responds to keyboard input (WASD/Arrows for movement, Space for dash) and mouse clicks (to start/restart).
    Persistence: Saves and loads the high score using localStorage.
    Window Resizing: Adjusts the canvas size and recenters the player when the browser window is resized.
    FPS Counter: Displays the Frames Per Second in the corner.
