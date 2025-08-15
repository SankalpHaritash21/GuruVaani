import numpy as np
import pandas as pd
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.layers import Dense, Flatten, Dropout, BatchNormalization, Conv2D, MaxPooling2D
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, CSVLogger, EarlyStopping, ReduceLROnPlateau
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

# Dataset directory paths
train_dir = './A/data/fer2013/train/'
test_dir = './A/data/fer2013/test/'

# Check if dataset paths exist
if not os.path.exists(train_dir) or not os.path.exists(test_dir):
    raise FileNotFoundError("Train or test directory does not exist. Please check your paths.")

# Image dimensions and number of classes
row, col = 48, 48
num_classes = 7

# Batch sizes
batch_size_cnn = 64
batch_size_others = 32
epochs = 50

# Set up image data generators
train_datagen = ImageDataGenerator(
    rescale=1./255,
    zoom_range=0.3,
    horizontal_flip=True
)

test_datagen = ImageDataGenerator(rescale=1./255)

# Create data generators
training_set = train_datagen.flow_from_directory(
    train_dir,
    target_size=(row, col),
    color_mode='grayscale',
    batch_size=batch_size_cnn,
    class_mode='categorical',
    shuffle=True
)

test_set = test_datagen.flow_from_directory(
    test_dir,
    target_size=(row, col),
    color_mode='grayscale',
    batch_size=batch_size_cnn,
    class_mode='categorical',
    shuffle=False
)

# Class label mapping
class_indices = training_set.class_indices
class_labels = {v: k for k, v in class_indices.items()}

# ========================
# Model Builders
# ========================

def build_baseline_cnn(input_shape=(row, col, 1), classes=num_classes):
    model = Sequential([
        Conv2D(32, (3, 3), padding='same', activation='relu', input_shape=input_shape),
        Conv2D(64, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        Dropout(0.25),

        Conv2D(128, (3, 3), activation='relu', padding='same',
               kernel_regularizer=tf.keras.regularizers.l2(0.01)),
        Conv2D(256, (3, 3), activation='relu',
               kernel_regularizer=tf.keras.regularizers.l2(0.01)),
        BatchNormalization(),
        MaxPooling2D(2, 2),
        Dropout(0.25),

        Flatten(),
        Dense(1024, activation='relu'),
        Dropout(0.5),
        Dense(classes, activation='softmax')
    ])
    model.compile(optimizer=Adam(learning_rate=0.001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model

def build_resnet50(input_shape=(row, col, 3), classes=num_classes):
    base_model = tf.keras.applications.ResNet50(
        weights=None,
        include_top=False,
        input_shape=input_shape
    )
    x = base_model.output
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = Dropout(0.5)(x)
    predictions = Dense(classes, activation='softmax')(x)
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer=Adam(learning_rate=0.001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model

def build_efficientnetb0(input_shape=(row, col, 3), classes=num_classes):
    base_model = tf.keras.applications.EfficientNetB0(
        weights=None,
        include_top=False,
        input_shape=input_shape
    )
    x = base_model.output
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = Dropout(0.5)(x)
    predictions = Dense(classes, activation='softmax')(x)
    model = Model(inputs=base_model.input, outputs=predictions)
    model.compile(optimizer=Adam(learning_rate=0.001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model

# Generator wrapper for RGB conversion
def preprocess_grayscale_to_rgb(generator, batch_size):
    while True:
        batch_x, batch_y = next(generator)
        batch_x_rgb = np.repeat(batch_x, 3, axis=-1)
        yield batch_x_rgb, batch_y

# ========================
# Training & Evaluation
# ========================

def train_and_evaluate(model_builder, model_name):
    print(f"\nTraining {model_name} ...")

    if model_name in ['ResNet50', 'EfficientNetB0']:
        current_batch_size = batch_size_others
        train_gen = preprocess_grayscale_to_rgb(training_set, current_batch_size)
        test_gen = preprocess_grayscale_to_rgb(test_set, current_batch_size)
        input_shape = (row, col, 3)
    else:
        current_batch_size = batch_size_cnn
        train_gen = training_set
        test_gen = test_set
        input_shape = (row, col, 1)

    model = model_builder(input_shape=input_shape, classes=num_classes)

    callbacks = [
        ModelCheckpoint(f'{model_name}_best_model.h5', monitor='val_loss', save_best_only=True, verbose=1),
        EarlyStopping(monitor='val_loss', patience=7, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=4, verbose=1),
        CSVLogger(f'{model_name}_training.log')
    ]

    steps_per_epoch = training_set.n // current_batch_size
    validation_steps = test_set.n // current_batch_size

    history = model.fit(
        train_gen,
        steps_per_epoch=steps_per_epoch,
        epochs=epochs,
        validation_data=test_gen,
        validation_steps=validation_steps,
        callbacks=callbacks,
        verbose=2
    )

    print(f"Evaluating {model_name} ...")

    # Collect test set for full prediction
    test_x = []
    test_y = []
    test_gen_eval = test_gen if model_name == "BaselineCNN" else preprocess_grayscale_to_rgb(test_set, current_batch_size)

    for _ in range(validation_steps):
        batch_x, batch_y = next(test_gen_eval)
        test_x.append(batch_x)
        test_y.append(batch_y)

    test_x = np.vstack(test_x)
    test_y = np.vstack(test_y)

    y_pred_probs = model.predict(test_x)
    y_pred = np.argmax(y_pred_probs, axis=1)
    y_true = np.argmax(test_y, axis=1)

    cm = confusion_matrix(y_true, y_pred)
    print(f"Confusion Matrix - {model_name}")
    print(cm)
    print(f"Classification Report - {model_name}")
    print(classification_report(y_true, y_pred, target_names=list(class_labels.values())))

    plt.figure(figsize=(8, 8))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title(f'Confusion Matrix - {model_name}')
    plt.colorbar()
    tick_marks = np.arange(num_classes)
    plt.xticks(tick_marks, class_labels.values(), rotation=45)
    plt.yticks(tick_marks, class_labels.values())
    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.show()

    results_dir = './results_models'
    os.makedirs(results_dir, exist_ok=True)
    pd.DataFrame(history.history).to_csv(os.path.join(results_dir, f'{model_name}_training_history.csv'), index=False)
    model.save(os.path.join(results_dir, f'{model_name}_model.h5'))

# ========================
# Run One Model (Choose)
# ========================

if __name__ == "__main__":
    # Uncomment ONE of the following at a time

    train_and_evaluate(build_baseline_cnn, "BaselineCNN")
    train_and_evaluate(build_resnet50, "ResNet50")
    train_and_evaluate(build_efficientnetb0, "EfficientNetB0")