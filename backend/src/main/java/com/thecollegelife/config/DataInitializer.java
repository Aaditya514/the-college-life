package com.thecollegelife.config;

import com.thecollegelife.entity.*;
import com.thecollegelife.repository.CollectionRepository;
import com.thecollegelife.repository.ReactionRepository;
import com.thecollegelife.repository.StoryRepository;
import com.thecollegelife.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "collegelife.seed-data", havingValue = "true", matchIfMissing = false)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StoryRepository storyRepository;
    private final ReactionRepository reactionRepository;
    private final CollectionRepository collectionRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            StoryRepository storyRepository,
            ReactionRepository reactionRepository,
            CollectionRepository collectionRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.storyRepository = storyRepository;
        this.reactionRepository = reactionRepository;
        this.collectionRepository = collectionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed default anonymous/demo student if not exists
        UUID defaultUserId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        User demoUser = userRepository.findById(defaultUserId).map(u -> {
            u.setPasswordHash(passwordEncoder.encode("password123"));
            return userRepository.save(u);
        }).orElseGet(() -> {
            User user = new User(
                    defaultUserId,
                    "student@thecollegelife.org",
                    passwordEncoder.encode("password123"),
                    "Campus Wanderer",
                    "assets/avatars/default.png",
                    "STUDENT"
            );
            return userRepository.save(user);
        });

        // Seed demo account: wanderer42@alumni.ac.in
        userRepository.findByEmail("wanderer42@alumni.ac.in").ifPresentOrElse(u -> {
            u.setPasswordHash(passwordEncoder.encode("password123"));
            u.setPublicPseudonym("wanderer_42");
            userRepository.save(u);
        }, () -> {
            User wanderer = new User(
                    UUID.fromString("42424242-4242-4242-4242-424242424242"),
                    "wanderer42@alumni.ac.in",
                    passwordEncoder.encode("password123"),
                    "wanderer_42",
                    "",
                    "STUDENT"
            );
            userRepository.save(wanderer);
        });

        // Seed admin account if not exists
        userRepository.findByEmail("admin@thecollegelife.org").ifPresentOrElse(u -> {
            u.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(u);
        }, () -> {
            User admin = new User(
                    UUID.randomUUID(),
                    "admin@thecollegelife.org",
                    passwordEncoder.encode("admin123"),
                    "Head Moderator",
                    "",
                    "ADMIN"
            );
            userRepository.save(admin);
        });

        if (storyRepository.count() == 0) {
            // Story 1: Nostalgia
            Story s1 = new Story();
            s1.setId(UUID.fromString("11111111-1111-1111-1111-111111111101"));
            s1.setTitle("The 3:00 AM Chai by Gate 4");
            s1.setContent("We had 12 backlogs between the three of us, no placement offers, and exactly 34 rupees in coins scattered across the bunk bed mattress. Ramesh's tapri near Gate 4 was still glowing under that flickering sodium lamp. We ordered two cutting chais and shared a half-broken biscuit, debating whether we would ever survive past 24.\n\nYesterday was our 10-year reunion. We now work in Seattle, Bangalore, and London. But sitting in a 5-star hotel lobby yesterday, none of our stock options or title promotions felt as rich as that muddy tea in chipped glass cups while shivering in oversized college hoodies.\n\nIf you are standing near Gate 4 tonight shivering before an 8 AM internal: hold on to the cup. You will miss the burn on your fingers for the rest of your life.");
            s1.setExcerpt("We had 12 backlogs between the three of us, no placement offers, and exactly 34 rupees in coins scattered across the bunk bed mattress. Ramesh's tapri near Gate 4 was still glowing under that flickering sodium lamp...");
            s1.setPillar(Pillar.NOSTALGIA);
            s1.setCategorySlug("midnight-maggi");
            s1.setPseudonym("Hostel 4 Philosopher");
            s1.setTags(List.of("late-night", "tea", "convocation", "hostel", "friendship"));
            s1.setReadingTime(3);
            s1.setViewsCount(1420);
            s1.setAuthor(demoUser);
            s1.setStatus(StoryStatus.PUBLISHED);
            Story saved1 = storyRepository.save(s1);

            // Story 2: Regret
            Story s2 = new Story();
            s2.setId(UUID.fromString("22222222-2222-2222-2222-222222222202"));
            s2.setTitle("I chose placements over the girl in Section B");
            s2.setContent("It was the 7th semester placement season. Everyone was panicking, practicing LeetCode until their eyes bled at 4 AM. She asked me if I wanted to sit on the library stairs during the autumn fest evening because she had something she wanted to tell me before we all scattered.\n\nI told her I had a mock interview in 20 minutes and couldn't make it. The truth was I was terrified. Terrified that loving someone would distract me from the 18 LPA dream my father talked about on every Sunday phone call.\n\nI got the Day-1 offer. My parents distributed sweets in our colony. But eight years later, in this corner apartment with high ceilings and silent hallways, I still stare at the ceiling wondering what she was going to say on those library stairs.");
            s2.setExcerpt("It was the 7th semester placement season. Everyone was panicking, practicing LeetCode until their eyes bled at 4 AM. She asked me if I wanted to sit on the library stairs during the autumn fest evening...");
            s2.setPillar(Pillar.REGRET);
            s2.setCategorySlug("unspoken-love");
            s2.setPseudonym("Back Row Chronicler");
            s2.setContentWarning("Mentions career anxiety & emotional isolation");
            s2.setTags(List.of("placement", "love", "regret", "career", "convocation"));
            s2.setReadingTime(4);
            s2.setViewsCount(2890);
            s2.setAuthor(demoUser);
            s2.setStatus(StoryStatus.PUBLISHED);
            Story saved2 = storyRepository.save(s2);

            // Story 3: Hope
            Story s3 = new Story();
            s3.setId(UUID.fromString("33333333-3333-3333-3333-333333333303"));
            s3.setTitle("Failing 5 subjects didn't kill me — it rebuilt me");
            s3.setContent("In 2nd year second semester, the results board was posted outside the Dean's office. Next to my roll number were 5 red 'F' grades. My GPA collapsed to 3.8. My roommates stopped asking me to study together because they thought failure was contagious. I locked myself in Room 218 for 4 days, listening to the ceiling fan creak.\n\nThen Professor Kulkarni stopped me near the water cooler. He didn't lecture me. He said: 'An exam measures what you memorized in three hours, not what you can build across forty years.'\n\nI retook every single subject. I spent weekends in the mechanical workshop learning CNC machining and embedded robotics from scratch. Today I run a robotics hardware startup employing 42 engineers. Your GPA is an invoice of past stress, not the deed to your future.");
            s3.setExcerpt("In 2nd year second semester, the results board was posted outside the Dean's office. Next to my roll number were 5 red 'F' grades. My GPA collapsed to 3.8. My roommates stopped asking me to study together...");
            s3.setPillar(Pillar.HOPE);
            s3.setCategorySlug("academic-redemption");
            s3.setPseudonym("Engineering Survivor");
            s3.setTags(List.of("academics", "redemption", "mental-health", "grades", "comeback"));
            s3.setReadingTime(4);
            s3.setViewsCount(3450);
            s3.setAuthor(demoUser);
            s3.setStatus(StoryStatus.PUBLISHED);
            Story saved3 = storyRepository.save(s3);

            // Story 4: Nostalgia
            Story s4 = new Story();
            s4.setId(UUID.fromString("44444444-4444-4444-4444-444444444404"));
            s4.setTitle("The empty chair in our final semester group photo");
            s4.setContent("We were four inseparable idiots who moved into Hostel 7 on the exact same August afternoon. We shared induction hotplates, borrowed socks without asking, and defended each other during warden inspections. In our final year, Siddharth received news that his visa came through early and had to leave before convocation week.\n\nOn photo day on the main lawns, we left one wooden chair empty right between us and balanced his favorite beat-up leather jacket over the backrest. The photographer asked if we wanted someone else to step in to balance the frame. We all yelled 'No!' at the exact same second.\n\nTo this day, that framed photo hangs in all three of our houses.");
            s4.setExcerpt("We were four inseparable idiots who moved into Hostel 7 on the exact same August afternoon. We shared induction hotplates, borrowed socks without asking, and defended each other during warden inspections...");
            s4.setPillar(Pillar.NOSTALGIA);
            s4.setCategorySlug("friendships-faded");
            s4.setPseudonym("Bench Five Dreamer");
            s4.setTags(List.of("farewell", "distance", "memories", "hostel", "friendship"));
            s4.setReadingTime(3);
            s4.setViewsCount(1120);
            s4.setAuthor(demoUser);
            s4.setStatus(StoryStatus.PUBLISHED);
            Story saved4 = storyRepository.save(s4);

            // Story 5: Regret
            Story s5 = new Story();
            s5.setId(UUID.fromString("55555555-5555-5555-5555-555555555505"));
            s5.setTitle("Never told my parents I hated Computer Science");
            s5.setContent("I wanted to study architecture and design sustainable homes. But my father was a retired government clerk who had spent his life savings on coaching classes so I could get into a premier engineering institute. The day I got admission into CSE, he cried tears of pride and hugged all the neighbors.\n\nI never had the courage to break his heart. For four years I forced my brain to understand compilers and operating systems that gave me migraine auras. I graduated with first class, but I felt like a hollow mannequin dressed in someone else's graduation gown.\n\nTo any fresher who feels sick opening their IDE: speak now before silence becomes twenty years of a life you didn't want.");
            s5.setExcerpt("I wanted to study architecture and design sustainable homes. But my father was a retired government clerk who had spent his life savings on coaching classes so I could get into a premier engineering institute...");
            s5.setPillar(Pillar.REGRET);
            s5.setCategorySlug("career-crises");
            s5.setPseudonym("The Reluctant Coder");
            s5.setContentWarning("Mentions burnout & parental expectation crisis");
            s5.setTags(List.of("pressure", "career", "parents", "burnout", "mental-health"));
            s5.setReadingTime(4);
            s5.setViewsCount(1980);
            s5.setAuthor(demoUser);
            s5.setStatus(StoryStatus.PUBLISHED);
            Story saved5 = storyRepository.save(s5);

            // Story 6: Hope
            Story s6 = new Story();
            s6.setId(UUID.fromString("66666666-6666-6666-6666-666666666606"));
            s6.setTitle("From being ostracized in 1st year to heading the drama club");
            s6.setContent("I stuttered whenever I got nervous in front of more than two people. During fresher intro week, some seniors made fun of my accent and speech cadence in the cafeteria. For six months I ate lunch in the library washroom stalls so nobody would look at me.\n\nOne evening I heard someone screaming passionately inside the amphitheater. It was the street play team rehearsing. The club head saw me watching from behind the pillar and said: 'If you have something burning inside you, we have a megaphone for it.'\n\nBy final year, I was directing a 40-member production that won the national inter-college gold. You don't have to fit into their mold; you can build a stage where your differences are the headline.");
            s6.setExcerpt("I stuttered whenever I got nervous in front of more than two people. During fresher intro week, some seniors made fun of my accent and speech cadence in the cafeteria...");
            s6.setPillar(Pillar.HOPE);
            s6.setCategorySlug("campus-identities");
            s6.setPseudonym("Stage Whisperer");
            s6.setTags(List.of("theatre", "belonging", "growth", "identity", "comeback"));
            s6.setReadingTime(4);
            s6.setViewsCount(2240);
            s6.setAuthor(demoUser);
            s6.setStatus(StoryStatus.PUBLISHED);
            Story saved6 = storyRepository.save(s6);

            // Seed initial reactions for rich interaction
            reactionRepository.save(new Reaction(saved1, defaultUserId, ReactionType.HEART));
            reactionRepository.save(new Reaction(saved1, defaultUserId, ReactionType.RELATABLE));
            reactionRepository.save(new Reaction(saved2, defaultUserId, ReactionType.TEAR));
            reactionRepository.save(new Reaction(saved2, defaultUserId, ReactionType.HUG));
            reactionRepository.save(new Reaction(saved3, defaultUserId, ReactionType.HOPEFUL));
            reactionRepository.save(new Reaction(saved3, defaultUserId, ReactionType.HEART));

            // Seed default bookmarks collection with stories 1 and 3
            Collection defaultCollection = new Collection(defaultUserId, "Favorite Memories", "❤️");
            defaultCollection.getStories().add(saved1);
            defaultCollection.getStories().add(saved3);
            collectionRepository.save(defaultCollection);
        }
    }
}
