import { Player } from '../player';
import { GameTime } from '@/src/core/domain/value-objects/game-time';

describe('Player Entity', () => {
  const playerId = 'player-123';
  const playerName = 'John Doe';
  const joinDate = new GameTime('2024-01-15T10:00:00.000Z');

  describe('constructor', () => {
    it('should create a player with required fields', () => {
      const player = new Player(playerId, playerName, joinDate);
      
      expect(player.id).toBe(playerId);
      expect(player.name).toBe(playerName);
      expect(player.joinDate).toBe(joinDate);
      expect(player.isActive).toBe(true);
      expect(player.email).toBeUndefined();
      expect(player.phone).toBeUndefined();
      expect(player.profileImageUrl).toBeUndefined();
      expect(player.notes).toBeUndefined();
    });

    it('should create a player with all optional fields', () => {
      const options = {
        email: 'john@example.com',
        phone: '+1234567890',
        isActive: false,
        profileImageUrl: 'https://example.com/avatar.jpg',
        notes: 'Regular player'
      };

      const player = new Player(playerId, playerName, joinDate, options);
      
      expect(player.email).toBe(options.email);
      expect(player.phone).toBe(options.phone);
      expect(player.isActive).toBe(options.isActive);
      expect(player.profileImageUrl).toBe(options.profileImageUrl);
      expect(player.notes).toBe(options.notes);
    });

    it('should trim whitespace from name', () => {
      const player = new Player(playerId, '  John Doe  ', joinDate);
      expect(player.name).toBe('John Doe');
    });

    it('should trim whitespace from optional fields', () => {
      const options = {
        email: '  john@example.com  ',
        phone: '  +1234567890  ',
        profileImageUrl: '  https://example.com/avatar.jpg  ',
        notes: '  Regular player  '
      };

      const player = new Player(playerId, playerName, joinDate, options);
      
      expect(player.email).toBe('john@example.com');
      expect(player.phone).toBe('+1234567890');
      expect(player.profileImageUrl).toBe('https://example.com/avatar.jpg');
      expect(player.notes).toBe('Regular player');
    });

    it('should throw error for empty ID', () => {
      expect(() => new Player('', playerName, joinDate)).toThrow('Player ID cannot be empty');
      expect(() => new Player('   ', playerName, joinDate)).toThrow('Player ID cannot be empty');
    });

    it('should throw error for empty name', () => {
      expect(() => new Player(playerId, '', joinDate)).toThrow('Player name cannot be empty');
      expect(() => new Player(playerId, '   ', joinDate)).toThrow('Player name cannot be empty');
    });
  });

  describe('updateName', () => {
    it('should update player name', () => {
      const player = new Player(playerId, playerName, joinDate);
      const newName = 'Jane Smith';
      
      player.updateName(newName);
      expect(player.name).toBe(newName);
    });

    it('should trim whitespace from new name', () => {
      const player = new Player(playerId, playerName, joinDate);
      
      player.updateName('  Jane Smith  ');
      expect(player.name).toBe('Jane Smith');
    });

    it('should throw error for empty name', () => {
      const player = new Player(playerId, playerName, joinDate);
      
      expect(() => player.updateName('')).toThrow('Player name cannot be empty');
      expect(() => player.updateName('   ')).toThrow('Player name cannot be empty');
    });
  });

  describe('updateEmail', () => {
    it('should update player email', () => {
      const player = new Player(playerId, playerName, joinDate);
      const email = 'john@example.com';
      
      player.updateEmail(email);
      expect(player.email).toBe(email);
    });

    it('should clear email when undefined', () => {
      const player = new Player(playerId, playerName, joinDate, { email: 'old@example.com' });
      
      player.updateEmail(undefined);
      expect(player.email).toBeUndefined();
    });

    it('should trim whitespace from email', () => {
      const player = new Player(playerId, playerName, joinDate);
      
      player.updateEmail('  john@example.com  ');
      expect(player.email).toBe('john@example.com');
    });
  });

  describe('updatePhone', () => {
    it('should update player phone', () => {
      const player = new Player(playerId, playerName, joinDate);
      const phone = '+1234567890';
      
      player.updatePhone(phone);
      expect(player.phone).toBe(phone);
    });

    it('should clear phone when undefined', () => {
      const player = new Player(playerId, playerName, joinDate, { phone: '+1111111111' });
      
      player.updatePhone(undefined);
      expect(player.phone).toBeUndefined();
    });

    it('should trim whitespace from phone', () => {
      const player = new Player(playerId, playerName, joinDate);
      
      player.updatePhone('  +1234567890  ');
      expect(player.phone).toBe('+1234567890');
    });
  });

  describe('activate and deactivate', () => {
    it('should activate player', () => {
      const player = new Player(playerId, playerName, joinDate, { isActive: false });
      
      player.activate();
      expect(player.isActive).toBe(true);
    });

    it('should deactivate player', () => {
      const player = new Player(playerId, playerName, joinDate, { isActive: true });
      
      player.deactivate();
      expect(player.isActive).toBe(false);
    });
  });

  describe('updateProfileImage', () => {
    it('should update profile image URL', () => {
      const player = new Player(playerId, playerName, joinDate);
      const imageUrl = 'https://example.com/avatar.jpg';
      
      player.updateProfileImage(imageUrl);
      expect(player.profileImageUrl).toBe(imageUrl);
    });

    it('should clear profile image when undefined', () => {
      const player = new Player(playerId, playerName, joinDate, { profileImageUrl: 'old-url.jpg' });
      
      player.updateProfileImage(undefined);
      expect(player.profileImageUrl).toBeUndefined();
    });

    it('should trim whitespace from image URL', () => {
      const player = new Player(playerId, playerName, joinDate);
      
      player.updateProfileImage('  https://example.com/avatar.jpg  ');
      expect(player.profileImageUrl).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('updateNotes', () => {
    it('should update player notes', () => {
      const player = new Player(playerId, playerName, joinDate);
      const notes = 'Regular tournament player';
      
      player.updateNotes(notes);
      expect(player.notes).toBe(notes);
    });

    it('should clear notes when undefined', () => {
      const player = new Player(playerId, playerName, joinDate, { notes: 'Old notes' });
      
      player.updateNotes(undefined);
      expect(player.notes).toBeUndefined();
    });

    it('should trim whitespace from notes', () => {
      const player = new Player(playerId, playerName, joinDate);
      
      player.updateNotes('  Regular tournament player  ');
      expect(player.notes).toBe('Regular tournament player');
    });
  });

  describe('hasBeenActiveSince', () => {
    it('should return true when player joined before the date', () => {
      const player = new Player(playerId, playerName, joinDate);
      const laterDate = new GameTime('2024-02-01T10:00:00.000Z');
      
      expect(player.hasBeenActiveSince(laterDate)).toBe(true);
    });

    it('should return true when player joined on the same date', () => {
      const player = new Player(playerId, playerName, joinDate);
      const sameDate = new GameTime('2024-01-15T10:00:00.000Z');
      
      expect(player.hasBeenActiveSince(sameDate)).toBe(true);
    });

    it('should return false when player joined after the date', () => {
      const player = new Player(playerId, playerName, joinDate);
      const earlierDate = new GameTime('2024-01-01T10:00:00.000Z');
      
      expect(player.hasBeenActiveSince(earlierDate)).toBe(false);
    });
  });

  describe('isNewPlayer', () => {
    it('should return true for recently joined player', () => {
      const recentDate = new GameTime(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)); // 10 days ago
      const player = new Player(playerId, playerName, recentDate);
      
      expect(player.isNewPlayer(30)).toBe(true);
    });

    it('should return false for player who joined long ago', () => {
      const oldDate = new GameTime(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)); // 60 days ago
      const player = new Player(playerId, playerName, oldDate);
      
      expect(player.isNewPlayer(30)).toBe(false);
    });

    it('should use default threshold of 30 days', () => {
      const recentDate = new GameTime(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)); // 20 days ago
      const player = new Player(playerId, playerName, recentDate);
      
      expect(player.isNewPlayer()).toBe(true);
    });

    it('should handle custom threshold', () => {
      const date = new GameTime(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)); // 5 days ago
      const player = new Player(playerId, playerName, date);
      
      expect(player.isNewPlayer(7)).toBe(true);
      expect(player.isNewPlayer(3)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for players with same ID', () => {
      const player1 = new Player(playerId, playerName, joinDate);
      const player2 = new Player(playerId, 'Different Name', joinDate);
      
      expect(player1.equals(player2)).toBe(true);
    });

    it('should return false for players with different IDs', () => {
      const player1 = new Player(playerId, playerName, joinDate);
      const player2 = new Player('different-id', playerName, joinDate);
      
      expect(player1.equals(player2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const player = new Player(playerId, playerName, joinDate);
      
      expect(player.toString()).toBe(`Player(${playerId}, ${playerName})`);
    });
  });

  describe('static create', () => {
    it('should create player with current time as join date', () => {
      const before = Date.now();
      const player = Player.create(playerId, playerName);
      const after = Date.now();
      
      expect(player.id).toBe(playerId);
      expect(player.name).toBe(playerName);
      expect(player.isActive).toBe(true);
      
      const joinTime = player.joinDate.value.getTime();
      expect(joinTime).toBeGreaterThanOrEqual(before);
      expect(joinTime).toBeLessThanOrEqual(after);
    });

    it('should create player with specified join date', () => {
      const customJoinDate = new GameTime('2023-12-01T10:00:00.000Z');
      const player = Player.create(playerId, playerName, { joinDate: customJoinDate });
      
      expect(player.joinDate).toBe(customJoinDate);
    });

    it('should create player with all options', () => {
      const options = {
        email: 'john@example.com',
        phone: '+1234567890',
        isActive: false,
        profileImageUrl: 'https://example.com/avatar.jpg',
        notes: 'VIP player',
        joinDate: joinDate
      };

      const player = Player.create(playerId, playerName, options);
      
      expect(player.email).toBe(options.email);
      expect(player.phone).toBe(options.phone);
      expect(player.isActive).toBe(options.isActive);
      expect(player.profileImageUrl).toBe(options.profileImageUrl);
      expect(player.notes).toBe(options.notes);
      expect(player.joinDate).toBe(options.joinDate);
    });
  });
});
