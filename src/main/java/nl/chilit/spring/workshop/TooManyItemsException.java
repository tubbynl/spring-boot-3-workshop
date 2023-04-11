package nl.chilit.spring.workshop;

public class TooManyItemsException extends RuntimeException {
    private final int maxItems;

    public TooManyItemsException(int maxItems) {
        this.maxItems = maxItems;
    }

    public int getMaxItems() {
        return maxItems;
    }
}
