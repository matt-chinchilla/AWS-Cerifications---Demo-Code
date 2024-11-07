# Import the Redis package
import redis

# Define the Redis endpoint and port
redisEndpoint = 'clustercfg.backspace-lab-redis.q7wll8.use1.cache.amazonaws.com'
PORT = 6379

# Configure Redis connection
def config_redis_connection():
    try:
        r = redis.Redis(
            host=redisEndpoint,
            port=PORT,
            socket_connect_timeout=20  # Increase the timeout period (in seconds)
        )
        print('Configured Redis node connection: ')
        print(r)
        return r
    except redis.exceptions.ConnectionError as e:
        print(f'ConnectionError: {e}')
        print('Possible causes: Redis server is not running, incorrect host/port, or network issues.')
        return None
    except redis.exceptions.TimeoutError as e:
        print(f'TimeoutError: {e}')
        print('Possible causes: Network latency, firewall rules, or security group settings.')
        return None
    except Exception as e:
        print(f'Error configuring Redis connection: {e}')
        return None

# Write to Redis cluster
def write_redis_key(r, new_key, new_value):
    if r is None:
        print('Redis connection is not configured.')
        return
    try:
        temp_success = r.set(new_key, new_value)
        if temp_success:
            print('Successfully wrote to Redis')
        else:
            print('Failed to write to Redis')
    except redis.exceptions.ConnectionError as e:
        print(f'ConnectionError: {e}')
        print('Possible causes: Redis server is not running, incorrect host/port, or network issues.')
    except redis.exceptions.TimeoutError as e:
        print(f'TimeoutError: {e}')
        print('Possible causes: Network latency, firewall rules, or security group settings.')
    except Exception as e:
        print(f'Error writing to Redis: {e}')

# Main program
def main():
    redis_connection = config_redis_connection()
    write_redis_key(redis_connection, 'myHighScore', 1000)

if __name__ == '__main__':
    main()