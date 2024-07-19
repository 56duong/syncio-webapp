from flask import Flask, request, jsonify
from sqlalchemy import create_engine, Column, BINARY, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.sql import func
import networkx as nx
import os
import uuid
import binascii
from flask_cors import CORS
from uuid import UUID
app = Flask(__name__)
CORS(app)

# Setup SQLAlchemy and NetworkX (from the previous setup)
Base = declarative_base()

def generate_uuid():
    return binascii.unhexlify(uuid.uuid4().hex)

def uuid_to_string(value):
    """Convert UUID from binary to string format."""
    return str(UUID(bytes=value))

follower_association = Table('user_followers', Base.metadata,
    Column('user_id', BINARY(16), ForeignKey('user.id')),
    Column('follower_id', BINARY(16), ForeignKey('user.id'))
)

class User(Base):
    __tablename__ = 'user'
    id = Column(BINARY(16), primary_key=True, default=generate_uuid)
    email = Column(String(89), nullable=False, unique=True)
    username = Column(String(30), nullable=False, unique=True)
    password = Column(String(100), nullable=False)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    followers = relationship("User",
                             secondary=follower_association,
                             primaryjoin=id == follower_association.c.user_id,
                             secondaryjoin=id == follower_association.c.follower_id,
                             backref="following")
    avturl = Column(String(255), nullable=True)

db_user = os.getenv('DB_USER', 'root')
db_pass = os.getenv('DB_PASS', '318674')
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'syncio-webapp')

engine_url = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:3306/{db_name}"
engine = create_engine(engine_url)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()
@app.route('/recommend', methods=['GET'])
def recommend_friends():
    username = request.args.get('username')
    top_n = int(request.args.get('top_n', 5))

    if not session:
        return jsonify({"error": "Database session not established."}), 500

    # Creating a network graph
    G = nx.Graph()
    users = session.query(User).all()
    for user in users:
        G.add_node(user.username)
        for follower in user.followers:
            G.add_edge(user.username, follower.username)

    if username not in G:
        return jsonify({"error": "User not found in the graph."}), 404

    # Finding recommendations
    recommendations = [(other, len(list(nx.common_neighbors(G, username, other))))
                       for other in set(G.nodes()) - {username} - set(G.neighbors(username))]
    recommendations.sort(key=lambda x: x[1], reverse=True)

    # Constructing the response
    response_data = []
    for rec_username, _ in recommendations[:top_n]:
        user = session.query(User).filter_by(username=rec_username).first()
        if user:
            response_data.append({
                "id": uuid_to_string(user.id),
                "username": user.username,
                "avatar": user.avturl,
            })

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)
