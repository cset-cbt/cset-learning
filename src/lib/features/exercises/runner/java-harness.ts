export const JAVA_HARNESS = `
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

public final class CsetHarness {
    public static void main(String[] args) throws Exception {
        System.setIn(new ByteArrayInputStream(args[0].getBytes(StandardCharsets.UTF_8)));
        Main.main(new String[0]);
        System.out.flush();
    }
}
`;
