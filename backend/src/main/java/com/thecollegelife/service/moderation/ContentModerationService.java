package com.thecollegelife.service.moderation;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContentModerationService {

    // 1. Campus Faculty / Staff with title + name pattern
    private static final Pattern FACULTY_PII_PATTERN = Pattern.compile(
            "\\b(Prof(?:essor)?|Dr|Doctor|Dean|HOD|Director|Warden)\\.?\\s+([A-Z][a-zA-Z]{1,20}(?:\\s+[A-Z][a-zA-Z]{1,20})?)",
            Pattern.CASE_INSENSITIVE
    );

    // 2. Indian & Global Phone Number Pattern
    private static final Pattern PHONE_NUMBER_PATTERN = Pattern.compile(
            "\\b(?:\\+91[\\-\\s]?)?[6-9]\\d{9}\\b"
    );

    // 3. Personal Email Pattern
    private static final Pattern PERSONAL_EMAIL_PATTERN = Pattern.compile(
            "\\b[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|rediffmail|icloud)\\.com\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 4. Hostel Room Specific Doxxing Pattern
    private static final Pattern HOSTEL_ROOM_PATTERN = Pattern.compile(
            "\\b(Hostel|Block|Hall|Wing|BH|GH)[\\s\\-]*([A-Za-z0-9]+)?[\\s,]+(?:Room|Rm)\\.?\\s*#?\\s*(\\d{2,4})\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 5. College Roll Number Pattern (e.g. 20BCSE102 or 10-digit roll)
    private static final Pattern ROLL_NUMBER_PATTERN = Pattern.compile(
            "\\b\\d{2}[A-Z]{2,4}\\d{3,6}\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 6. Defamation and Libel Keywords
    private static final Pattern DEFAMATION_PATTERN = Pattern.compile(
            "\\b(is a bad (?:guy|person|boy|girl)|is a thief|is a rapist|is a fraud|is a creep|is a pervert|is a cheater|" +
            "is toxic|sleeping with|caught having sex|leaked mms|selling question papers|pay to pass|" +
            "stay away from|beware of|boycott his|boycott her|dont trust him|dont trust her)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 7. Crisis & Self-Harm Indicators
    private static final Pattern CRISIS_PATTERN = Pattern.compile(
            "\\b(kill myself|want to die|commit suicide|ending my life|end my life|hang myself)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 8. General & College Abuse, Slurs & Profanity (English + Hindi/Hinglish)
    private static final Pattern ABUSE_SLUR_PATTERN = Pattern.compile(
            "\\b(asshole|bastard|bitch|cunt|dickhead|motherfucker|fucker|fuck you|fucking|slut|whore|retard|bullshit|" +
            "piece of shit|scumbag|chutiya|chutiye|chutiyapa|bhenchod|behenchod|bc|madarchod|mc|bhosdike|bhosadi|" +
            "harami|kamina|kamine|saala|saale|randi|gandu|gaandu|lodu|lauda|lawda|lund|chinal|suar|kutte|kutti)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 9. Targeted Individual Defamation Callout (e.g. "rajnish of 4t yr is a bad guy", "aman is a creep")
    private static final Pattern INDIVIDUAL_DEFAMATION_PATTERN = Pattern.compile(
            "\\b([a-zA-Z]{3,20})(?:\\s+(?:of|from|in)\\s+[a-zA-Z0-9\\s]{1,15})?\\s+(?:is|was|are)\\s+(?:a|an)?\\s*" +
            "(?:bad(?:\\s*(?:guy|person|boy|girl|man|woman))?|creep|pervert|cheater|fraud|thief|toxic|snake|scumbag|" +
            "liar|harasser|bully|horrible|terrible|worst|evil|asshole|bastard|chutiya|kamina|gandu|randi)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 10. Campus Peer Attribution Pattern (e.g. "rajnish of 4t yr", "rohan in cse")
    private static final Pattern CAMPUS_PEER_ATTRIBUTION_PATTERN = Pattern.compile(
            "\\b([a-zA-Z]{3,20})\\s+(?:of|from|in)\\s+(?:(?:[1-4]|final)(?:st|nd|rd|th|t)?\\s*(?:yr|year|sem|semester)?|batch\\s*(?:of)?\\s*\\d{2,4}|(?:cse|it|ece|ee|mech|civil|chemical|biotech|mba|mca|btech|b\\.tech)\\s*(?:branch|dept|department)?)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 11. Targeted Boycott or Callout Pattern
    private static final Pattern CALLOUT_TARGET_PATTERN = Pattern.compile(
            "\\b(?:beware of|stay away from|warning\\s+(?:everyone\\s+|all\\s+)?(?:about|against)|boycott(?:s|ing)?(?:\\s+his|\\s+her|\\s+their)?|expose|dont trust|never trust|complaint against)\\s+([a-zA-Z0-9\\s.]{2,30})\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 12. Faculty Quarters / Residential Location Doxxing Pattern
    private static final Pattern QUARTERS_DOXXING_PATTERN = Pattern.compile(
            "\\b(?:personal\\s+quarters|staff\\s+quarters|faculty\\s+quarters|prof(?:essor)?'?s?\\s+quarters|staff\\s+block\\s+[A-Za-z0-9]+|teachers?\\s+colony)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 13. Contextual Person Identification Pattern (e.g. "crush on Sneha", "dated Rohan", "with Pooja")
    private static final Pattern CONTEXTUAL_NAME_PATTERN = Pattern.compile(
            "\\b(?:my crush|crush on|dated|dating|with|broke up with|in love with|hated|cheated on|fought with|" +
            "talked to|confessed to|sat next to|roommate was|roommate is|friend named|girl named|guy named|boy named|" +
            "senior named|junior named|batchmate named)\\s+([a-zA-Z]{3,20})\\b",
            Pattern.CASE_INSENSITIVE
    );

    // 13. Curated High-Frequency Personal Given Names Dictionary (Indian & Common Student Names)
    private static final Set<String> COMMON_STUDENT_NAMES = new HashSet<>(Arrays.asList(
            // Male given names
            "aarav", "aakash", "aayush", "abhinav", "abhishek", "aditya", "ajay", "akhil", "aman", "amar",
            "amit", "anand", "aniket", "ankit", "ansh", "anshul", "anurag", "arjun", "aryan", "ashish",
            "ayush", "bharat", "bhavya", "chetan", "chirag", "deepak", "dev", "dhruv", "divyansh", "gaurav",
            "harsh", "harshit", "himanshu", "hitesh", "ishaan", "jaideep", "jatin", "kabir", "karan", "kartik",
            "keshav", "kshitij", "kunal", "lakshya", "madhav", "manan", "manish", "mayank", "meet", "mohit",
            "mukund", "naman", "naveen", "neeraj", "nikhil", "nishant", "nitin", "pankaj", "paras", "parth",
            "pawan", "piyush", "pranav", "pranay", "prateek", "pratik", "priyansh", "puneet", "raghav", "rahul",
            "rajat", "rajeev", "rakesh", "raman", "rishabh", "ritesh", "rohan", "rohit", "ronit", "sachin",
            "sahil", "sameer", "sanjay", "sanket", "sarthak", "sarvesh", "saurabh", "shaurya", "shivam", "shreyas",
            "shubham", "siddhant", "siddharth", "sparsh", "sumit", "suraj", "suyash", "tanmay", "tarun", "tushar",
            "uday", "utkarsh", "vaibhav", "varun", "vedant", "vicky", "vidit", "vikas", "vikram", "vinay",
            "vipul", "vishal", "vivek", "yash", "yashwant", "yuvi", "yuvraj",
            "rajnish", "rajneesh", "ankur", "anupam", "abhitosh", "animesh", "avinash", "alok", "bipin", "chandresh",
            "debanjan", "debashis", "dhiren", "durgesh", "girish", "harish", "jagdish", "kamlesh", "kuldeep", "lokesh",
            "mahesh", "mukesh", "naresh", "pradeep", "prakash", "pramod", "prashant", "pravin", "raghunath", "rajendra",
            "sandeep", "sanjeev", "saroj", "satish", "shailesh", "somesh", "subhash", "sudarshan", "suresh", "umesh",
            "upendra", "vijay", "virendra", "yogesh", "ashutosh", "arpit", "asish", "bhavesh", "chandan", "darshan",
            "dinesh", "hardik", "hemant", "jaspreet", "jeet", "jitendra", "kamal", "kiran", "kishore", "krishna",
            "lalit", "manoj", "mridul", "narendra", "omkar", "pavan", "prabhat", "prajwal", "pranjal", "pratap",
            "raghu", "raj", "rajesh", "rajan", "ramesh", "ranjan", "ranjeet", "ranjit", "ratan", "ravi", "ravindra",
            "ritik", "rituraj", "roshan", "rupak", "rishi", "rudra", "samrat", "santosh", "satyam", "shekhar", "shyam",
            "somnath", "sourav", "srinivas", "subhashish", "sudhir", "sudip", "sudipto", "surya", "sushant", "swapnil",
            "tejas", "ujjwal", "veer", "venkatesh", "vignesh", "vikrant", "vimal", "vinayak", "vipin", "vishnu",
            // Female given names
            "aakanksha", "aanya", "aashi", "aditi", "ahana", "aishwarya", "akanksha", "alisha", "amrita", "anamika",
            "ananya", "anika", "ankita", "anmol", "anushka", "anya", "arpita", "arya", "ashna", "barkha",
            "bhavna", "charu", "damini", "deepika", "deepti", "disha", "divya", "drishti", "garima", "gauri",
            "gayatri", "harshita", "himani", "ishani", "ishita", "jahnvi", "jaya", "jyoti", "kajal", "kashish",
            "kavya", "khushi", "kirti", "komal", "kriti", "kritika", "lavanya", "mahak", "mahima", "mansi",
            "megha", "mehak", "muskan", "navya", "neha", "nidhi", "nikita", "nisha", "nitya", "palak",
            "pallavi", "parul", "payal", "pooja", "poonam", "prachi", "pragya", "prerna", "priya", "priyanka",
            "radhika", "rashi", "raveena", "richa", "riddhima", "riya", "roshni", "ruchi", "sakshi", "saloni",
            "samridhi", "sanskriti", "sanjana", "saumya", "shambhavi", "shivangi", "shivani", "shreya", "shrishti",
            "shruti", "simran", "sneha", "somya", "sonali", "srishti", "tanya", "tanvi", "tara", "trisha",
            "urvashi", "vaishnavi", "vanshika", "varsha", "vidhi", "vrinda", "yukta", "zoya",
            "radha", "rashmi", "reena", "rekha", "renu", "rina", "rupa", "sarita", "seema", "shobha", "smita",
            "sudha", "sujata", "sulekha", "sunita", "sushma", "swati", "usha", "vandana", "veena", "vidya",
            "alka", "anita", "anu", "anuradha", "archana", "babita", "beena", "bharti", "bindu", "chitra",
            "deepa", "geeta", "indira", "kamla", "kanta", "kumud", "kusum", "lalita", "madhu", "madhuri",
            "malti", "mamta", "manju", "meena", "meenakshi", "mohini", "naina", "neelam", "neeru", "nirmala",
            "padma", "pushpa", "rajni", "ranjana", "sadhana", "sangita", "sarla", "shakuntala", "shanti",
            "sharda", "sheetal", "shikha", "sudesh", "suman", "surekha", "sushila", "taruna", "uma", "urmila", "vinita"
    ));

    public ModerationResult evaluate(String title, String content) {
        String fullText = (title != null ? title : "") + " " + (content != null ? content : "");
        int score = 0;
        List<String> flags = new ArrayList<>();
        List<String> notes = new ArrayList<>();

        // 1. Check Faculty PII
        Matcher facultyMatcher = FACULTY_PII_PATTERN.matcher(fullText);
        if (facultyMatcher.find()) {
            score += 50;
            String matched = facultyMatcher.group(0);
            flags.add("PII_FACULTY_NAME");
            notes.add("Mentions specific faculty/staff (" + matched + ")");
        }

        // 2. Check Real Personal Student Names (Dictionary Check)
        Set<String> detectedNames = findPersonalNames(fullText);
        if (!detectedNames.isEmpty()) {
            score += 50;
            flags.add("PII_PERSONAL_NAME");
            notes.add("Contains real personal name(s): " + String.join(", ", detectedNames) + 
                      ". Real student names are prohibited to preserve community privacy.");
        }

        // 3. Check Contextual Personal Name Pattern
        Matcher contextNameMatcher = CONTEXTUAL_NAME_PATTERN.matcher(fullText);
        if (contextNameMatcher.find()) {
            String candidate = contextNameMatcher.group(1);
            if (!flags.contains("PII_PERSONAL_NAME") && candidate.length() > 2) {
                score += 45;
                flags.add("PII_PERSONAL_NAME");
                notes.add("Contextually references a real person's name ('" + candidate + "')");
            }
        }

        // 4. Check Abuse, Slurs & Profanity
        Matcher abuseMatcher = ABUSE_SLUR_PATTERN.matcher(fullText);
        if (abuseMatcher.find()) {
            score += 70;
            flags.add("ABUSIVE_OR_HATE_SPEECH");
            notes.add("Contains abusive language or slurs ('" + abuseMatcher.group(0) + "')");
        }

        // 5. Check Phone Number
        Matcher phoneMatcher = PHONE_NUMBER_PATTERN.matcher(fullText);
        if (phoneMatcher.find()) {
            score += 60;
            flags.add("PII_PHONE_NUMBER");
            notes.add("Contains real phone number");
        }

        // 6. Check Email
        Matcher emailMatcher = PERSONAL_EMAIL_PATTERN.matcher(fullText);
        if (emailMatcher.find()) {
            score += 40;
            flags.add("PII_EMAIL_ADDRESS");
            notes.add("Contains personal email address");
        }

        // 7. Check Hostel Room Doxxing
        Matcher roomMatcher = HOSTEL_ROOM_PATTERN.matcher(fullText);
        if (roomMatcher.find()) {
            score += 45;
            String matchedRoom = roomMatcher.group(0);
            flags.add("PII_HOSTEL_ROOM");
            notes.add("Mentions identifiable hostel room (" + matchedRoom + ")");
        }

        // 8. Check Roll Number
        Matcher rollMatcher = ROLL_NUMBER_PATTERN.matcher(fullText);
        if (rollMatcher.find()) {
            score += 40;
            flags.add("PII_ROLL_NUMBER");
            notes.add("Contains student roll/registration number");
        }

        // 9. Check Defamation / Harassment General Phrasing
        Matcher defMatcher = DEFAMATION_PATTERN.matcher(fullText);
        if (defMatcher.find()) {
            score += 65;
            flags.add("HARASSMENT_DEFAMATION");
            notes.add("Contains defamatory or harassment phrasing (" + defMatcher.group(0) + ")");
        }

        // 10. Check Targeted Individual Defamation Callout (e.g. "rajnish of 4t yr is a bad guy")
        Matcher indivDefMatcher = INDIVIDUAL_DEFAMATION_PATTERN.matcher(fullText);
        if (indivDefMatcher.find()) {
            score += 85;
            flags.add("HARASSMENT_DEFAMATION");
            flags.add("PII_PERSONAL_NAME");
            notes.add("Targeted individual defamation/harassment detected ('" + indivDefMatcher.group(0) + "')");
        }

        // 11. Check Campus Peer Attribution Pattern (e.g. "rajnish of 4t yr")
        Matcher peerMatcher = CAMPUS_PEER_ATTRIBUTION_PATTERN.matcher(fullText);
        if (peerMatcher.find()) {
            score += 60;
            flags.add("PII_PERSONAL_NAME");
            notes.add("Campus peer attribution detected ('" + peerMatcher.group(0) + "')");
        }

        // 12. Check Targeted Public Callout / Boycott Pattern (e.g. "Warning everyone about Professor Sharma")
        Matcher calloutMatcher = CALLOUT_TARGET_PATTERN.matcher(fullText);
        if (calloutMatcher.find()) {
            score += 75;
            flags.add("HARASSMENT_DEFAMATION");
            notes.add("Targeted callout / boycott against individual ('" + calloutMatcher.group(0) + "')");
        }

        // 13. Check Faculty Quarters / Residential Location Doxxing
        Matcher quartersMatcher = QUARTERS_DOXXING_PATTERN.matcher(fullText);
        if (quartersMatcher.find()) {
            score += 55;
            flags.add("PII_FACULTY_LOCATION");
            notes.add("Mentions private faculty residence / quarters ('" + quartersMatcher.group(0) + "')");
        }

        // 14. Check Crisis / Distress
        Matcher crisisMatcher = CRISIS_PATTERN.matcher(fullText);
        if (crisisMatcher.find()) {
            score += 55;
            flags.add("CRISIS_SUPPORT_TRIGGER");
            notes.add("Mentions self-harm / emotional crisis (Helpline trigger)");
        }

        // Compute Decision
        boolean flagged = score >= 40;
        String recommendedAction = "PUBLISH";

        // Auto-reject any story with score >= 70, or targeted defamation/harassment targeting students or faculty
        boolean isSevereTargeting = flags.contains("HARASSMENT_DEFAMATION") && 
                (flags.contains("PII_PERSONAL_NAME") || flags.contains("PII_FACULTY_NAME") || flags.contains("ABUSIVE_OR_HATE_SPEECH"));

        if (score >= 70 || isSevereTargeting) {
            recommendedAction = "AUTO_REJECT";
        } else if (score >= 40) {
            recommendedAction = "FLAG_FOR_REVIEW";
        }

        String explanation = notes.isEmpty() ? "Safe community submission" : String.join("; ", notes);
        return new ModerationResult(flagged, Math.min(100, score), flags, recommendedAction, explanation);
    }

    private Set<String> findPersonalNames(String text) {
        Set<String> found = new LinkedHashSet<>();
        // Split text by non-alphanumeric characters
        String[] words = text.split("[^a-zA-Z]+");
        for (String word : words) {
            if (word.length() < 3) continue;
            String lower = word.toLowerCase();
            if (COMMON_STUDENT_NAMES.contains(lower)) {
                found.add(word);
            }
        }
        return found;
    }
}
