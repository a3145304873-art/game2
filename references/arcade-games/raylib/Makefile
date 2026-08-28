CC = gcc
CFLAGS = -Wall -Wextra -O2
LDFLAGS = -lraylib -lm -lpthread -ldl -lrt -lX11

TARGET = arcade
SRCS = main.c snake.c breakout.c scores.c
OBJS = $(SRCS:.c=.o)

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $@ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET) .arcade_scores

run: $(TARGET)
	./$(TARGET)
