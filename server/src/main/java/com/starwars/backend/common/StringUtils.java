package com.starwars.backend.common;

import java.util.Random;

public class StringUtils {
    private static final Random random = new Random();

    public static String randomString(final int length) {
        int leftLimit = 48; // "0"
        int rightLimit = 122; // "z"/**/

        return random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || (i >= 65 && i <= 90) || i >= 97))
                .limit(length)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }
}
